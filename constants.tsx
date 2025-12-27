
import { Property, Applicant } from './types';

export const COLORS = {
  primary: '#6366F1', // Indigo
  secondary: '#06B6D4', // Cyan
  bg: '#0F172A',
  surface: '#1E293B',
  success: '#10B981',
};

const TENANCY_OPTIONS = ["Flexible", "1 Month", "3 Months", "6 Months", "1 Year", "2+ Years"];

// Helper function to generate random property details
export const generatePropertyDetails = (type: string, rent: number): Pick<Property, 'description' | 'amenities' | 'specs' | 'additionalInfo'> => {
  const isLuxury = rent > 1500;
  
  const descriptions = [
    `A stunning ${type.toLowerCase()} located in a prime area, offering modern living spaces and excellent connectivity.`,
    `Charming and cozy ${type.toLowerCase()} perfect for those seeking comfort and style in the heart of the city.`,
    `Spacious ${type.toLowerCase()} with breathtaking views and premium finishes throughout.`,
    `Recently renovated ${type.toLowerCase()} featuring state-of-the-art appliances and a contemporary design.`,
    `Elegant ${type.toLowerCase()} situated in a quiet neighborhood, ideal for peaceful living with easy city access.`
  ];

  const amenitiesList = [
    'High-Speed Wi-Fi', 'Central Heating', 'Air Conditioning', 'Balcony', 
    'Dishwasher', 'Washing Machine', 'Smart Home System', 'Double Glazing',
    'Hardwood Floors', 'Walk-in Closet', 'Concierge Service', 'Elevator',
    'Private Parking', 'Gym Access', 'Swimming Pool', 'Rooftop Terrace', 
    'Garden Access', 'Bicycle Storage', '24/7 Security'
  ];

  // Select 4-8 random amenities
  const shuffledAmenities = amenitiesList.sort(() => 0.5 - Math.random());
  const selectedAmenities = shuffledAmenities.slice(0, Math.floor(Math.random() * 5) + 4);

  let specs = {
    bedrooms: 1,
    bathrooms: 1,
    sqFt: 400,
    yearBuilt: 1990 + Math.floor(Math.random() * 34)
  };

  switch (type) {
    case 'Studio':
      specs = { ...specs, bedrooms: 0, bathrooms: 1, sqFt: 250 + Math.floor(Math.random() * 150) };
      break;
    case 'Apartment':
      specs = { ...specs, bedrooms: 1 + Math.floor(Math.random() * 3), bathrooms: 1 + Math.floor(Math.random() * 2), sqFt: 500 + Math.floor(Math.random() * 600) };
      break;
    case 'House':
      specs = { ...specs, bedrooms: 3 + Math.floor(Math.random() * 3), bathrooms: 2 + Math.floor(Math.random() * 2), sqFt: 1200 + Math.floor(Math.random() * 1000) };
      break;
    case 'Loft':
      specs = { ...specs, bedrooms: 1 + Math.floor(Math.random() * 2), bathrooms: 1 + Math.floor(Math.random() * 2), sqFt: 800 + Math.floor(Math.random() * 600) };
      break;
  }

  return {
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    amenities: selectedAmenities,
    specs,
    additionalInfo: {
      petPolicy: Math.random() > 0.6 ? 'Pets Allowed' : (Math.random() > 0.5 ? 'Cats Only' : 'No Pets'),
      furnishedStatus: Math.random() > 0.5 ? 'Fully Furnished' : 'Unfurnished',
      transport: Math.random() > 0.5 ? 'Metro within 5 mins' : 'Bus stop nearby'
    }
  };
};

const BASE_PROPERTIES: Omit<Property, 'description' | 'amenities' | 'specs' | 'additionalInfo'>[] = [
  // --- Apartments (6) ---
  {
    id: 'prop-1',
    address: '15 Rue de Rivoli, Paris',
    rent: 1450,
    type: 'Apartment',
    availableFrom: '2024-05-01',
    createdAt: '2024-02-15T10:00:00Z',
    images: ['https://picsum.photos/seed/paris1/800/600'],
    minIncome: 4350,
    minSeniorityMonths: 12,
    requireSavingsBuffer: true,
    requireGuarantor: true,
    employmentTypes: ['CDI'],
    features: ['Furnished', 'Balcony', 'FHE Verified'],
    applicantsCount: 12,
    maxMissedPayments: 0,
    maxOccupants: 3,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-apt-2',
    address: '88 Boulevard Saint-Germain, Paris',
    rent: 2100,
    type: 'Apartment',
    availableFrom: '2024-06-01',
    createdAt: '2024-03-10T14:30:00Z',
    images: ['https://picsum.photos/seed/paris_lux/800/600'],
    minIncome: 6300,
    minSeniorityMonths: 24,
    requireSavingsBuffer: true,
    requireGuarantor: false,
    employmentTypes: ['CDI', 'Freelance'],
    features: ['Luxury', 'Elevator', 'Concierge'],
    applicantsCount: 4,
    maxMissedPayments: 0,
    maxOccupants: 4,
    minTenancyDuration: "2+ Years"
  },
  {
    id: 'prop-apt-3',
    address: '12 Rue des Archives, Lyon',
    rent: 980,
    type: 'Apartment',
    availableFrom: '2024-05-20',
    createdAt: '2024-04-01T09:15:00Z',
    images: ['https://picsum.photos/seed/lyon_apt/800/600'],
    minIncome: 2940,
    minSeniorityMonths: 6,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'CDD'],
    features: ['Central', 'Quiet'],
    applicantsCount: 18,
    maxMissedPayments: 1,
    maxOccupants: 2,
    minTenancyDuration: "6 Months"
  },
  {
    id: 'prop-apt-4',
    address: '55 Rue de la Pompe, Paris',
    rent: 1800,
    type: 'Apartment',
    availableFrom: '2024-07-01',
    createdAt: '2024-04-15T12:00:00Z',
    images: ['https://picsum.photos/seed/paris_pompe/800/600'],
    minIncome: 5400,
    minSeniorityMonths: 18,
    requireSavingsBuffer: true,
    requireGuarantor: true,
    employmentTypes: ['CDI'],
    features: ['Renovated', 'Parking'],
    applicantsCount: 6,
    maxMissedPayments: 0,
    maxOccupants: 3,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-apt-5',
    address: '24 Quai de la Rapée, Paris',
    rent: 1600,
    type: 'Apartment',
    availableFrom: '2024-06-15',
    createdAt: '2024-04-20T10:30:00Z',
    images: ['https://picsum.photos/seed/paris_rapee/800/600'],
    minIncome: 4800,
    minSeniorityMonths: 12,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'CDD'],
    features: ['River View', 'Subway'],
    applicantsCount: 9,
    maxMissedPayments: 1,
    maxOccupants: 2,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-apt-6',
    address: '8 Place Kléber, Strasbourg',
    rent: 1100,
    type: 'Apartment',
    availableFrom: '2024-08-01',
    createdAt: '2024-04-25T14:00:00Z',
    images: ['https://picsum.photos/seed/strasbourg_apt/800/600'],
    minIncome: 3300,
    minSeniorityMonths: 6,
    requireSavingsBuffer: true,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'Freelance'],
    features: ['Historic', 'City Center'],
    applicantsCount: 15,
    maxMissedPayments: 0,
    maxOccupants: 3,
    minTenancyDuration: "Flexible"
  },

  // --- Studios (6) ---
  {
    id: 'prop-2',
    address: '22 Avenue Jean Médecin, Nice',
    rent: 950,
    type: 'Studio',
    availableFrom: '2024-06-15',
    createdAt: '2024-03-20T11:20:00Z',
    images: ['https://picsum.photos/seed/nice1/800/600'],
    minIncome: 2850,
    minSeniorityMonths: 6,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'CDD', 'Student'],
    features: ['Ocean View', 'Air Conditioning'],
    applicantsCount: 5,
    maxMissedPayments: 1,
    maxOccupants: 2,
    minTenancyDuration: "6 Months"
  },
  {
    id: 'prop-std-2',
    address: '45 Rue de la République, Marseille',
    rent: 650,
    type: 'Studio',
    availableFrom: '2024-05-05',
    createdAt: '2024-04-12T16:45:00Z',
    images: ['https://picsum.photos/seed/marseille/800/600'],
    minIncome: 1950,
    minSeniorityMonths: 3,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['Student', 'CDD'],
    features: ['Near Campus', 'Fiber Internet'],
    applicantsCount: 22,
    maxMissedPayments: 2,
    maxOccupants: 1,
    minTenancyDuration: "Flexible"
  },
  {
    id: 'prop-std-3',
    address: '5 Place du Capitole, Toulouse',
    rent: 780,
    type: 'Studio',
    availableFrom: '2024-07-01',
    createdAt: '2024-04-18T10:00:00Z',
    images: ['https://picsum.photos/seed/toulouse/800/600'],
    minIncome: 2340,
    minSeniorityMonths: 0,
    requireSavingsBuffer: true,
    requireGuarantor: true,
    employmentTypes: ['Student', 'Intern'],
    features: ['Historic Center', 'Renovated'],
    applicantsCount: 8,
    maxMissedPayments: 0,
    maxOccupants: 1,
    minTenancyDuration: "3 Months"
  },
  {
    id: 'prop-std-4',
    address: '10 Rue des Écoles, Paris',
    rent: 1100,
    type: 'Studio',
    availableFrom: '2024-09-01',
    createdAt: '2024-05-01T09:00:00Z',
    images: ['https://picsum.photos/seed/paris_latin/800/600'],
    minIncome: 3300,
    minSeniorityMonths: 0,
    requireSavingsBuffer: true,
    requireGuarantor: true,
    employmentTypes: ['Student'],
    features: ['Latin Quarter', 'Quiet'],
    applicantsCount: 12,
    maxMissedPayments: 0,
    maxOccupants: 1,
    minTenancyDuration: "6 Months"
  },
  {
    id: 'prop-std-5',
    address: '3 Cours Mirabeau, Aix-en-Provence',
    rent: 850,
    type: 'Studio',
    availableFrom: '2024-06-20',
    createdAt: '2024-04-10T15:00:00Z',
    images: ['https://picsum.photos/seed/aix_studio/800/600'],
    minIncome: 2550,
    minSeniorityMonths: 6,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'Student'],
    features: ['Sunny', 'Elevator'],
    applicantsCount: 7,
    maxMissedPayments: 1,
    maxOccupants: 1,
    minTenancyDuration: "1 Month"
  },
  {
    id: 'prop-std-6',
    address: '18 Rue Sainte-Catherine, Bordeaux',
    rent: 720,
    type: 'Studio',
    availableFrom: '2024-07-15',
    createdAt: '2024-04-28T11:45:00Z',
    images: ['https://picsum.photos/seed/bordeaux_std/800/600'],
    minIncome: 2160,
    minSeniorityMonths: 3,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['Student', 'CDD'],
    features: ['Shopping Area', 'Tram'],
    applicantsCount: 10,
    maxMissedPayments: 0,
    maxOccupants: 1,
    minTenancyDuration: "Flexible"
  },

  // --- Houses (5) ---
  {
    id: 'prop-house-1',
    address: '10 Chemin du Vignoble, Bordeaux',
    rent: 2500,
    type: 'House',
    availableFrom: '2024-08-01',
    createdAt: '2024-03-05T13:00:00Z',
    images: ['https://picsum.photos/seed/bordeaux_house/800/600'],
    minIncome: 7500,
    minSeniorityMonths: 24,
    requireSavingsBuffer: true,
    requireGuarantor: false,
    employmentTypes: ['CDI', 'Self-Employed'],
    features: ['Garden', 'Garage', 'Pet Friendly'],
    applicantsCount: 3,
    maxMissedPayments: 0,
    maxOccupants: 5,
    minTenancyDuration: "2+ Years"
  },
  {
    id: 'prop-house-2',
    address: '28 Allée des Cyprès, Aix-en-Provence',
    rent: 3200,
    type: 'House',
    availableFrom: '2024-09-01',
    createdAt: '2024-03-15T09:30:00Z',
    images: ['https://picsum.photos/seed/aix_house/800/600'],
    minIncome: 9600,
    minSeniorityMonths: 36,
    requireSavingsBuffer: true,
    requireGuarantor: false,
    employmentTypes: ['CDI', 'Business Owner'],
    features: ['Pool', 'Solar Panels', 'Smart Home'],
    applicantsCount: 1,
    maxMissedPayments: 0,
    maxOccupants: 6,
    minTenancyDuration: "2+ Years"
  },
  {
    id: 'prop-house-3',
    address: '14 Route de la Mer, Saint-Malo',
    rent: 1900,
    type: 'House',
    availableFrom: '2024-06-01',
    createdAt: '2024-04-02T16:20:00Z',
    images: ['https://picsum.photos/seed/stmalo_house/800/600'],
    minIncome: 5700,
    minSeniorityMonths: 12,
    requireSavingsBuffer: true,
    requireGuarantor: false,
    employmentTypes: ['CDI', 'Retired'],
    features: ['Sea View', 'Terrace'],
    applicantsCount: 5,
    maxMissedPayments: 0,
    maxOccupants: 4,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-house-4',
    address: '5 Impasse des Lilas, Nantes',
    rent: 1650,
    type: 'House',
    availableFrom: '2024-07-01',
    createdAt: '2024-04-15T10:00:00Z',
    images: ['https://picsum.photos/seed/nantes_house/800/600'],
    minIncome: 4950,
    minSeniorityMonths: 12,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['CDI'],
    features: ['Quiet Area', 'Garden'],
    applicantsCount: 8,
    maxMissedPayments: 1,
    maxOccupants: 4,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-house-5',
    address: '9 Rue du Château, Annecy',
    rent: 2800,
    type: 'House',
    availableFrom: '2024-09-15',
    createdAt: '2024-05-01T13:45:00Z',
    images: ['https://picsum.photos/seed/annecy_house/800/600'],
    minIncome: 8400,
    minSeniorityMonths: 24,
    requireSavingsBuffer: true,
    requireGuarantor: false,
    employmentTypes: ['CDI', 'International'],
    features: ['Lake View', 'Modern'],
    applicantsCount: 2,
    maxMissedPayments: 0,
    maxOccupants: 5,
    minTenancyDuration: "1 Year"
  },

  // --- Lofts (5) ---
  {
    id: 'prop-loft-1',
    address: 'Old Port Warehouse, Lille',
    rent: 1800,
    type: 'Loft',
    availableFrom: '2024-06-01',
    createdAt: '2024-04-05T15:20:00Z',
    images: ['https://picsum.photos/seed/lille_loft/800/600'],
    minIncome: 5400,
    minSeniorityMonths: 12,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'Freelance'],
    features: ['High Ceilings', 'Industrial Style'],
    applicantsCount: 7,
    maxMissedPayments: 1,
    maxOccupants: 2,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-loft-2',
    address: 'Canal Saint-Martin, Paris',
    rent: 2800,
    type: 'Loft',
    availableFrom: '2024-07-15',
    createdAt: '2024-04-10T11:00:00Z',
    images: ['https://picsum.photos/seed/paris_loft/800/600'],
    minIncome: 8400,
    minSeniorityMonths: 24,
    requireSavingsBuffer: true,
    requireGuarantor: false,
    employmentTypes: ['CDI', 'Artist'],
    features: ['Water View', 'Open Space', 'Atelier'],
    applicantsCount: 15,
    maxMissedPayments: 0,
    maxOccupants: 3,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-loft-3',
    address: '15 Rue de la Soie, Lyon',
    rent: 2200,
    type: 'Loft',
    availableFrom: '2024-08-01',
    createdAt: '2024-04-22T09:30:00Z',
    images: ['https://picsum.photos/seed/lyon_loft/800/600'],
    minIncome: 6600,
    minSeniorityMonths: 18,
    requireSavingsBuffer: true,
    requireGuarantor: false,
    employmentTypes: ['CDI', 'Tech'],
    features: ['Duplex', 'Rooftop'],
    applicantsCount: 5,
    maxMissedPayments: 0,
    maxOccupants: 2,
    minTenancyDuration: "1 Year"
  },
  {
    id: 'prop-loft-4',
    address: '42 Quai des Chartrons, Bordeaux',
    rent: 1950,
    type: 'Loft',
    availableFrom: '2024-06-10',
    createdAt: '2024-04-18T14:15:00Z',
    images: ['https://picsum.photos/seed/bordeaux_loft/800/600'],
    minIncome: 5850,
    minSeniorityMonths: 12,
    requireSavingsBuffer: true,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'Freelance'],
    features: ['Exposed Brick', 'River'],
    applicantsCount: 8,
    maxMissedPayments: 1,
    maxOccupants: 2,
    minTenancyDuration: "6 Months"
  },
  {
    id: 'prop-loft-5',
    address: '7 Rue de la Mode, Marseille',
    rent: 1500,
    type: 'Loft',
    availableFrom: '2024-07-20',
    createdAt: '2024-05-02T10:00:00Z',
    images: ['https://picsum.photos/seed/marseille_loft/800/600'],
    minIncome: 4500,
    minSeniorityMonths: 6,
    requireSavingsBuffer: false,
    requireGuarantor: true,
    employmentTypes: ['CDI', 'Creator'],
    features: ['Large Windows', 'Sunny'],
    applicantsCount: 12,
    maxMissedPayments: 0,
    maxOccupants: 2,
    minTenancyDuration: "Flexible"
  }
];

export const MOCK_PROPERTIES: Property[] = BASE_PROPERTIES.map(p => ({
  ...p,
  ...generatePropertyDetails(p.type, p.rent)
}));

export const MOCK_APPLICANTS: Applicant[] = [
  { 
    id: 'app-1', 
    anonymousId: 'Applicant #A7F3', 
    status: 'qualified', 
    appliedDate: '2024-03-12',
    stabilityScore: 92,
    reliabilityIndex: 98,
    metricsPassed: { 
      income: true, 
      seniority: true, 
      savings: true, 
      guarantor: true,
      reliability: true,
      capacity: true
    }
  },
  { 
    id: 'app-2', 
    anonymousId: 'Applicant #B2E9', 
    status: 'not-qualified', 
    appliedDate: '2024-03-14',
    stabilityScore: 45,
    reliabilityIndex: 60,
    metricsPassed: { 
      income: false, 
      seniority: true, 
      savings: false, 
      guarantor: true,
      reliability: true,
      capacity: false
    }
  },
];
