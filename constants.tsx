
import React from 'react';
import { 
  FlagType, 
  ReviewStatus, 
  PurchaseDocument, 
  UserRole,
  User
} from './types';

// Using the Great Seal of the United States (public domain) for a reliable, official look.
export const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Great_Seal_of_the_United_States_%28obverse%29.svg/600px-Great_Seal_of_the_United_States_%28obverse%29.svg.png"; 

export const DEMO_ACCOUNTS: Record<string, User> = {
  'reviewer@nhguard.gov': {
    id: 'u1',
    name: 'Sarah Reviewer',
    email: 'reviewer@nhguard.gov',
    role: UserRole.REVIEWER,
    organization: 'NH School District Office',
    avatar: 'https://picsum.photos/80/80?random=10'
  },
  'submitter@nhguard.gov': {
    id: 'u2',
    name: 'Mark Submitter',
    email: 'submitter@nhguard.gov',
    role: UserRole.SUBMITTER,
    organization: 'Central High School',
    avatar: 'https://picsum.photos/80/80?random=11'
  },
  'viewer@nhguard.gov': {
    id: 'u3',
    name: 'Dr. Thompson',
    email: 'viewer@nhguard.gov',
    role: UserRole.VIEWER,
    organization: 'District Office',
    avatar: 'https://picsum.photos/80/80?random=12'
  }
};

export const MOCK_PURCHASES: PurchaseDocument[] = [
  {
    id: '1',
    vendor: 'Office Depot',
    date: '2023-10-24',
    amount: 1250.45,
    description: 'Bulk toner cartridges for Admin Dept',
    category: 'Supplies',
    flags: [
      {
        type: FlagType.DUPLICATE,
        reason: 'Possible duplicate purchase from 2 days ago',
        context: 'Previous order #4421 for similar amount.'
      }
    ],
    status: ReviewStatus.FLAGGED,
    department: 'Central Admin',
    submittedBy: 'Mark Submitter'
  },
  {
    id: '2',
    vendor: 'Zoom Video',
    date: '2023-11-01',
    amount: 540.00,
    description: 'Annual Pro Subscription - High School',
    category: 'Software',
    flags: [
      {
        type: FlagType.RENEWAL,
        reason: 'Subscription renewal detected',
        context: 'Price increased by 15% from last year.'
      }
    ],
    status: ReviewStatus.PENDING,
    department: 'Education',
    submittedBy: 'Mark Submitter'
  },
  {
    id: '3',
    vendor: 'Amazon Business',
    date: '2023-10-20',
    amount: 89.99,
    description: 'Wireless presenter remote',
    category: 'Hardware',
    flags: [],
    status: ReviewStatus.VALIDATED,
    department: 'IT',
    submittedBy: 'Sarah Reviewer'
  },
  {
    id: '4',
    vendor: 'Granite State Cleaning',
    date: '2023-10-15',
    amount: 2400.00,
    description: 'Floor waxing - Elementary gym',
    category: 'Maintenance',
    flags: [
      {
        type: FlagType.PRICE_ANOMALY,
        reason: 'Price significantly higher than average',
        context: 'Average for this service is $1,800.00'
      }
    ],
    status: ReviewStatus.FLAGGED,
    department: 'Facilities',
    submittedBy: 'Mark Submitter'
  }
];

export const APP_NAME = "NH Receipt Guard";
export const TAGLINE = "Stop waste before it's spent — simple, smart, and fast.";
