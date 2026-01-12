
export enum UserRole {
  SUBMITTER = 'SUBMITTER',
  REVIEWER = 'REVIEWER',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatar?: string;
}

export enum FlagType {
  DUPLICATE = 'DUPLICATE',
  PRICE_ANOMALY = 'PRICE_ANOMALY',
  RENEWAL = 'RENEWAL',
  UNUSUAL_ITEM = 'UNUSUAL_ITEM',
  MARKET_DEVIATION = 'MARKET_DEVIATION', // The "$500 Hammer" flag
  ZOMBIE_SPEND = 'ZOMBIE_SPEND',         // Unused subscription flag
  // Rejection-specific flags
  WASTE = 'WASTE',                       // Flagged as wasteful spending
  POLICY_VIOLATION = 'POLICY_VIOLATION', // Violates procurement policy
  INSUFFICIENT_DOCS = 'INSUFFICIENT_DOCS', // Missing documentation
  UNAUTHORIZED = 'UNAUTHORIZED',         // Unauthorized purchase
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',   // Potential fraud
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',   // Over budget limits
  OTHER = 'OTHER'                        // Other rejection reason
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  RESOLVED = 'RESOLVED',
  FLAGGED = 'FLAGGED',
  REJECTED = 'REJECTED'
}

export interface Flag {
  type: FlagType;
  reason: string;
  context?: string;
}

export interface PurchaseDocument {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  flags: Flag[];
  status: ReviewStatus;
  fileUrl?: string;
  department: string;
  submittedBy: string;
  // AI enriched fields
  aiConfidence?: number;
  suggestedGlCode?: string;
  // DOGE Efficiency Fields
  marketPriceEstimate?: number; // AI's guess at fair market value
  isSubscription?: boolean;
  // Rejection details
  rejectionFlags?: FlagType[];  // Flags applied when rejecting
  rejectionNotes?: string;      // Reviewer notes for rejection
  rejectedBy?: string;          // Who rejected it
  rejectedAt?: string;          // When it was rejected
}

export interface AppSettings {
  duplicateWindowDays: number;
  priceVarianceThreshold: number;
  renewalAlertDays: number;
}

// Impact Storyteller interfaces
export interface ImpactEquivalent {
  category: string;
  quantity: number;
  description: string;
  iconName: string;
}

export interface ImpactStory {
  period: { start: string; end: string };
  savingsAmount: number;
  impactEquivalents: ImpactEquivalent[];
  narrative: {
    boardPresentation: string;
    parentNewsletter: string;
    stateReport: string;
  };
  keyHighlights: string[];
}

// Contract Constellation interfaces
export interface PriceIndex {
  normalizedItemId: string;
  itemName: string;
  vendorPrices: {
    vendorId: string;
    vendorName: string;
    avgPrice: number;
    priceRange: { min: number; max: number };
    districtCount: number;
    lastUpdated: string;
  }[];
  stateAverage: number;
  nationalBenchmark?: number;
}

export interface VendorScore {
  vendorId: string;
  vendorName: string;
  competitivenessScore: number; // 0-100
  reliabilityScore: number; // 0-100
  avgPriceVsMarket: number; // Percentage difference
  transactionCount: number;
}

// Budget Guardian interfaces
export interface Commitment {
  vendor: string;
  amount: number;
  renewalDate: string;
  escapable: boolean;
  cancellationDeadline?: string;
  escalationClause?: string;
}

export interface SpendForecast {
  month: string;
  projectedSpend: {
    committed: number;
    discretionary: number;
    confidence: number;
  };
  commitments: Commitment[];
}

// Submitter Efficiency interfaces
export interface SubmitterMetrics {
  approvalRate: number;
  avgReviewTimeDays: number;
  totalSubmissions: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  currentStreak: number;
  monthlySpend: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

// Department Budget interfaces
export interface DepartmentBudget {
  name: string;
  total: number;
  used: number;
  projectedExhaustionDate?: string;
  categories: CategorySpend[];
}

export interface CategorySpend {
  name: string;
  amount: number;
  percentage: number;
}

// Price Memory interfaces
export interface VendorPriceHistory {
  vendor: string;
  itemNormalized: string;
  purchases: HistoricalPurchase[];
  avgPrice: number;
  bestPrice: number;
}

export interface HistoricalPurchase {
  vendor: string;
  amount: number;
  date: string;
  itemDescription: string;
}

// Rejection Fix-It interfaces
export interface RejectionFixSuggestion {
  suggestion: string;
  alternativeVendors?: string[];
  estimatedSavings?: number;
  learningTip?: string;
}
