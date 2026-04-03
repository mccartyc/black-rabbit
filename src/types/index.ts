export interface RentCastListing {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  hoa?: number;
  price: number;
  listingType?: string;
  listedDate?: string;
  status: string;
  daysOnMarket?: number;
  mlsName?: string;
  mlsNumber?: string;
}

export interface RentCastRentEstimate {
  rent: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  latitude?: number;
  longitude?: number;
}

export interface RentEstimateParams {
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
}

export interface InvestmentAssumptions {
  downPaymentPct: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxPct: number;
  insurancePct: number;
  maintenancePct: number;
  vacancyPct: number;
  managementPct: number;
  capexPct: number;
  closingCostPct: number;
}

export interface InvestmentMetrics {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  closingCosts: number;
  totalCashInvested: number;
  monthlyMortgage: number;
  monthlyRent: number;
  monthlyVacancyLoss: number;
  effectiveMonthlyRent: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyManagement: number;
  monthlyCapEx: number;
  totalMonthlyExpenses: number;
  monthlyNOI: number;
  monthlyCashFlow: number;
  annualGrossRent: number;
  annualEffectiveRent: number;
  annualExpenses: number;
  annualNOI: number;
  annualDebtService: number;
  annualCashFlow: number;
  capRate: number;
  cashOnCash: number;
  grm: number | null;
  dscr: number | null;
}
