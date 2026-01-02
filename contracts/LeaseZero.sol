// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LeaseZero
 * @notice A production-ready leasing platform that verifies tenant eligibility privately using FHE.
 * @dev Implements access control, reentrancy protection, and pausable functionality for security.
 */
contract LeaseZero is Ownable, ReentrancyGuard, Pausable, ZamaEthereumConfig {

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant PROTOCOL_FEE = 0.0001 ether;
    uint256 public constant MAX_OCCUPANTS = 20;
    uint256 public constant MAX_LISTINGS_PER_LANDLORD = 50;
    address public constant DEV_FEE_RECEIVER =
        0xE89BDF2f6216F0c0F02cc60bd87692D06eB17B3d;

    /*//////////////////////////////////////////////////////////////
                                 ENUMS
    //////////////////////////////////////////////////////////////*/

    enum ApplicationStatus {
        Pending,
        Approved,
        Rejected,
        Withdrawn,
        Expired
    }

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct EncryptedProfile {
        euint32 income;
        euint32 seniority;
        euint32 savings;
        euint32 guarantorIncome;
        euint32 missedPayments;
        euint32 householdSize;
        ebool exists;
        bool isInitialized;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Listing {
        address landlord;
        uint32 minIncome;
        uint32 minSeniority;
        uint32 maxMissedPayments;
        uint32 maxOccupants;
        bool requireSavings;
        bool requireGuarantor;
        bool active;
        uint256 createdAt;
    }

    struct Application {
        address tenant;
        uint256 listingId;
        ebool eligibilityResult;
        ApplicationStatus status;
        bytes32 documentHash;
        uint256 createdAt;
        bool eligibilityRevealed;
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 public listingCount;
    uint256 public applicationCount;
    uint256 public protocolFeeAmount = PROTOCOL_FEE;

    mapping(address => EncryptedProfile) public profiles;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Application) public applications;
    
    // Duplicate prevention: keccak256(abi.encodePacked(tenant, listingId)) => exists
    mapping(bytes32 => bool) public applicationExists;
    
    // Track listings per landlord
    mapping(address => uint256) public landlordListingCount;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event FeePaid(address indexed payer, string action);
    event ProfileSealed(address indexed tenant, uint256 timestamp);
    event ProfileUpdated(address indexed tenant, uint256 timestamp);
    event ListingCreated(uint256 indexed listingId, address indexed landlord);
    event ListingDeactivated(uint256 indexed listingId);
    event EligibilityChecked(uint256 indexed applicationId, address indexed tenant, uint256 indexed listingId);
    event DocumentsSubmitted(uint256 indexed applicationId);
    event ApplicationApproved(uint256 indexed applicationId);
    event ApplicationRejected(uint256 indexed applicationId);
    event ApplicationWithdrawn(uint256 indexed applicationId);
    event ProtocolFeeUpdated(uint256 newFee);

    /*//////////////////////////////////////////////////////////////
                           ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emergency pause all contract functions
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract functions
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Update protocol fee (only owner)
     * @param newFee New fee amount in wei
     */
    function updateProtocolFee(uint256 newFee) external onlyOwner {
        require(newFee <= 0.01 ether, "Fee too high");
        protocolFeeAmount = newFee;
        emit ProtocolFeeUpdated(newFee);
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL: FEE LOGIC
    //////////////////////////////////////////////////////////////*/

    function _collectFee(string memory action) internal {
        require(msg.value == protocolFeeAmount, "Incorrect protocol fee");

        (bool sent, ) = DEV_FEE_RECEIVER.call{value: msg.value}("");
        require(sent, "Fee transfer failed");

        emit FeePaid(msg.sender, action);
    }

    /*//////////////////////////////////////////////////////////////
                          TENANT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create or update encrypted tenant profile
     * @param incomeInput Encrypted income value
     * @param seniorityInput Encrypted job tenure in months
     * @param savingsInput Encrypted savings amount
     * @param guarantorIncomeInput Encrypted guarantor income
     * @param missedPaymentsInput Encrypted missed payment count
     * @param householdSizeInput Encrypted household size
     * @param inputProof ZK proof for encrypted inputs
     */
    function setProfile(
        externalEuint32 incomeInput,
        externalEuint32 seniorityInput,
        externalEuint32 savingsInput,
        externalEuint32 guarantorIncomeInput,
        externalEuint32 missedPaymentsInput,
        externalEuint32 householdSizeInput,
        bytes calldata inputProof
    ) external payable nonReentrant whenNotPaused {
        _collectFee("SET_PROFILE");

        euint32 income = FHE.fromExternal(incomeInput, inputProof);
        euint32 seniority = FHE.fromExternal(seniorityInput, inputProof);
        euint32 savings = FHE.fromExternal(savingsInput, inputProof);
        euint32 guarantorIncome = FHE.fromExternal(guarantorIncomeInput, inputProof);
        euint32 missedPayments = FHE.fromExternal(missedPaymentsInput, inputProof);
        euint32 householdSize = FHE.fromExternal(householdSizeInput, inputProof);
        ebool exists = FHE.asEbool(true);

        bool isUpdate = profiles[msg.sender].isInitialized;
        uint256 timestamp = block.timestamp;

        profiles[msg.sender] = EncryptedProfile({
            income: income,
            seniority: seniority,
            savings: savings,
            guarantorIncome: guarantorIncome,
            missedPayments: missedPayments,
            householdSize: householdSize,
            exists: exists,
            isInitialized: true,
            createdAt: isUpdate ? profiles[msg.sender].createdAt : timestamp,
            updatedAt: timestamp
        });

        // Grant FHE permissions for user decryption and contract calculation
        FHE.allowThis(income);
        FHE.allow(income, msg.sender);
        FHE.allowThis(seniority);
        FHE.allow(seniority, msg.sender);
        FHE.allowThis(savings);
        FHE.allow(savings, msg.sender);
        FHE.allowThis(guarantorIncome);
        FHE.allow(guarantorIncome, msg.sender);
        FHE.allowThis(missedPayments);
        FHE.allow(missedPayments, msg.sender);
        FHE.allowThis(householdSize);
        FHE.allow(householdSize, msg.sender);
        FHE.allowThis(exists);
        FHE.allow(exists, msg.sender);

        if (isUpdate) {
            emit ProfileUpdated(msg.sender, timestamp);
        } else {
            emit ProfileSealed(msg.sender, timestamp);
        }
    }

    /*//////////////////////////////////////////////////////////////
                         LANDLORD FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new property listing
     * @param minIncome Minimum monthly income requirement
     * @param minSeniority Minimum job tenure in months
     * @param maxMissedPayments Maximum allowed missed payments
     * @param maxOccupants Maximum household size
     * @param requireSavings Whether savings buffer is required
     * @param requireGuarantor Whether guarantor is required
     */
    function createListing(
        uint32 minIncome,
        uint32 minSeniority,
        uint32 maxMissedPayments,
        uint32 maxOccupants,
        bool requireSavings,
        bool requireGuarantor
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        _collectFee("CREATE_LISTING");

        // Input validation
        require(minIncome > 0, "Invalid minimum income");
        require(maxOccupants > 0 && maxOccupants <= MAX_OCCUPANTS, "Invalid max occupants");
        require(landlordListingCount[msg.sender] < MAX_LISTINGS_PER_LANDLORD, "Listing limit reached");

        listings[listingCount] = Listing(
            msg.sender,
            minIncome,
            minSeniority,
            maxMissedPayments,
            maxOccupants,
            requireSavings,
            requireGuarantor,
            true,
            block.timestamp
        );

        landlordListingCount[msg.sender]++;
        emit ListingCreated(listingCount, msg.sender);
        listingCount++;
        return listingCount - 1;
    }

    /**
     * @notice Deactivate a listing (landlord only)
     * @param listingId ID of the listing to deactivate
     */
    function deactivateListing(uint256 listingId) external {
        require(listingId < listingCount, "Invalid listing ID");
        Listing storage listing = listings[listingId];
        require(listing.landlord == msg.sender, "Not listing owner");
        require(listing.active, "Already inactive");

        listing.active = false;
        landlordListingCount[msg.sender]--;
        emit ListingDeactivated(listingId);
    }

    /*//////////////////////////////////////////////////////////////
                     CONFIDENTIAL ELIGIBILITY
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Check tenant eligibility for a listing using FHE
     * @param listingId ID of the listing to check against
     * @return applicationId The ID of the created application
     */
    function checkEligibility(uint256 listingId)
        external
        whenNotPaused
        returns (uint256)
    {
        // Validation
        require(listingId < listingCount, "Invalid listing ID");
        Listing memory l = listings[listingId];
        require(l.active, "Listing not active");
        
        // Check for duplicate application
        bytes32 appKey = keccak256(abi.encodePacked(msg.sender, listingId));
        require(!applicationExists[appKey], "Application already exists");
        
        // Verify profile exists (checking public flag for control flow)
        EncryptedProfile storage p = profiles[msg.sender];
        require(p.isInitialized, "Profile not found");

        // Ensure profile exists (using ebool exists)
        // Note: In Zama, we use selection to handle "if-exists" privately if needed,
        // but here we just proceed with the computation. 
        // If 'exists' is false, the results will still be valid encrypted handles.

        ebool incomeOk = FHE.ge(p.income, l.minIncome);
        ebool seniorityOk = FHE.ge(p.seniority, l.minSeniority);
        ebool missedOk = FHE.le(p.missedPayments, l.maxMissedPayments);
        ebool occupantsOk = FHE.le(p.householdSize, l.maxOccupants);

        ebool savingsOk = l.requireSavings
            ? FHE.ge(p.savings, l.minIncome * 3)
            : FHE.asEbool(true);

        ebool guarantorOk = l.requireGuarantor
            ? FHE.ge(p.guarantorIncome, l.minIncome * 4)
            : FHE.asEbool(true);

        ebool eligible = FHE.and(
            FHE.and(incomeOk, seniorityOk),
            FHE.and(
                FHE.and(missedOk, occupantsOk),
                FHE.and(savingsOk, guarantorOk)
            )
        );

        // Mask with the 'exists' flag to ensure non-existing profiles don't pass
        eligible = FHE.and(eligible, p.exists);

        applications[applicationCount] = Application({
            tenant: msg.sender,
            listingId: listingId,
            eligibilityResult: eligible,
            status: ApplicationStatus.Pending,
            documentHash: bytes32(0),
            createdAt: block.timestamp,
            eligibilityRevealed: false
        });

        // Mark application as existing
        applicationExists[appKey] = true;

        // "Double-Allow" to let the tenant see their own eligibility status privately
        FHE.allowThis(eligible);
        FHE.allow(eligible, msg.sender);

        emit EligibilityChecked(applicationCount, msg.sender, listingId);
        applicationCount++;
        return applicationCount - 1;
    }

    /**
     * @notice Step 1 of the Public Reveal: Mark a handle as publicly decryptable.
     */
    function requestPublicReveal(uint256 applicationId) external {
        Application storage app = applications[applicationId];
        require(app.tenant == msg.sender, "Not the tenant");
        require(app.status == ApplicationStatus.Pending, "Invalid status");

        // Make the encrypted result publicly decryptable by the Gateway
        FHE.makePubliclyDecryptable(app.eligibilityResult);
    }

    /**
     * @notice Step 3 of the Public Reveal: Verify the KMS proof and finalize the clear state.
     */
    function finalizePublicReveal(
        uint256 applicationId,
        bytes memory abiEncodedResult,
        bytes memory decryptionProof
    ) external {
        Application storage app = applications[applicationId];
        require(app.status == ApplicationStatus.Pending, "Invalid status");

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(app.eligibilityResult);

        // Verify the proof from the Gateway
        FHE.checkSignatures(cts, abiEncodedResult, decryptionProof);

        // Mark as revealed
        app.eligibilityRevealed = true;
    }

    /*//////////////////////////////////////////////////////////////
                         DOCUMENT VERIFICATION
    //////////////////////////////////////////////////////////////*/

    function submitDocumentHash(
        uint256 applicationId,
        bytes32 docHash
    ) external {
        Application storage app = applications[applicationId];
        require(app.tenant == msg.sender, "Not tenant");
        require(app.status == ApplicationStatus.Pending, "Invalid status");
        require(docHash != bytes32(0), "Invalid document hash");

        app.documentHash = docHash;
        emit DocumentsSubmitted(applicationId);
    }

    /**
     * @notice Approve an application (landlord only)
     * @param applicationId ID of the application to approve
     */
    function approveApplication(uint256 applicationId) external {
        Application storage app = applications[applicationId];
        Listing memory l = listings[app.listingId];

        require(msg.sender == l.landlord, "Not landlord");
        require(app.status == ApplicationStatus.Pending, "Invalid status");
        require(app.documentHash != bytes32(0), "Documents not submitted");

        app.status = ApplicationStatus.Approved;
        emit ApplicationApproved(applicationId);
    }

    /**
     * @notice Reject an application (landlord only)
     * @param applicationId ID of the application to reject
     */
    function rejectApplication(uint256 applicationId) external {
        Application storage app = applications[applicationId];
        Listing memory l = listings[app.listingId];

        require(msg.sender == l.landlord, "Not landlord");
        require(app.status == ApplicationStatus.Pending, "Invalid status");

        app.status = ApplicationStatus.Rejected;
        emit ApplicationRejected(applicationId);
    }

    /**
     * @notice Withdraw an application (tenant only)
     * @param applicationId ID of the application to withdraw
     */
    function withdrawApplication(uint256 applicationId) external {
        Application storage app = applications[applicationId];
        require(app.tenant == msg.sender, "Not tenant");
        require(app.status == ApplicationStatus.Pending, "Invalid status");

        app.status = ApplicationStatus.Withdrawn;
        
        // Remove from duplicate prevention
        bytes32 appKey = keccak256(abi.encodePacked(msg.sender, app.listingId));
        applicationExists[appKey] = false;
        
        emit ApplicationWithdrawn(applicationId);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get encrypted eligibility result for an application
     * @param applicationId ID of the application
     * @return Encrypted eligibility result
     */
    function getEligibilityResult(uint256 applicationId)
        external
        view
        returns (ebool)
    {
        Application storage app = applications[applicationId];
        return app.eligibilityResult;
    }

    /**
     * @notice Check if a profile exists for an address
     * @param tenant Address to check
     * @return Whether the profile exists
     */
    function profileExists(address tenant) external view returns (bool) {
        return profiles[tenant].isInitialized;
    }
}