import type { InvestmentAssumptions, InvestmentMetrics, RentCastListing, RentCastRentEstimate } from '@/types';

function monthlyMortgagePayment(principal: number, annualRate: number, termYears: number): number {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateMetrics(
  listing: RentCastListing,
  rentEstimate: RentCastRentEstimate,
  assumptions: InvestmentAssumptions
): InvestmentMetrics {
  const price = listing.price;
  const monthlyRent = rentEstimate.rent;
  const annualGrossRent = monthlyRent * 12;

  // Financing
  const downPayment = price * assumptions.downPaymentPct;
  const loanAmount = price - downPayment;
  const closingCosts = price * assumptions.closingCostPct;
  const totalCashInvested = downPayment + closingCosts;
  const monthlyMortgage = monthlyMortgagePayment(loanAmount, assumptions.interestRate, assumptions.loanTermYears);
  const annualDebtService = monthlyMortgage * 12;

  // Income
  const monthlyVacancyLoss = monthlyRent * assumptions.vacancyPct;
  const effectiveMonthlyRent = monthlyRent - monthlyVacancyLoss;
  const annualEffectiveRent = effectiveMonthlyRent * 12;

  // Expenses (monthly)
  const monthlyPropertyTax = (price * assumptions.propertyTaxPct) / 12;
  const monthlyInsurance = (price * assumptions.insurancePct) / 12;
  const monthlyMaintenance = (price * assumptions.maintenancePct) / 12;
  const monthlyManagement = effectiveMonthlyRent * assumptions.managementPct;
  const monthlyCapEx = effectiveMonthlyRent * assumptions.capexPct;
  const totalMonthlyExpenses =
    monthlyPropertyTax + monthlyInsurance + monthlyMaintenance + monthlyManagement + monthlyCapEx;

  const annualExpenses = totalMonthlyExpenses * 12;

  // NOI (no mortgage)
  const monthlyNOI = effectiveMonthlyRent - totalMonthlyExpenses;
  const annualNOI = monthlyNOI * 12;

  // Cash flow (after mortgage)
  const monthlyCashFlow = monthlyNOI - monthlyMortgage;
  const annualCashFlow = monthlyCashFlow * 12;

  // Returns
  const capRate = price > 0 ? (annualNOI / price) * 100 : 0;
  const cashOnCash = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
  const grm = annualGrossRent > 0 ? price / annualGrossRent : null;
  const dscr = annualDebtService > 0 ? annualNOI / annualDebtService : null;

  // Max purchase price
  // Derived by solving: targetCapRate = NOI / Price, where NOI accounts for
  // price-based expenses (tax, insurance, maintenance) and rent-based expenses
  // (management, capex). Rearranges to:
  // Price = effectiveAnnualRent * (1 - mgmt - capex) / (targetCapRate + tax + insurance + maintenance)
  const targetCapRateDecimal = assumptions.targetCapRate / 100;
  const maxPriceByCapRate =
    annualEffectiveRent * (1 - assumptions.managementPct - assumptions.capexPct) /
    (targetCapRateDecimal + assumptions.propertyTaxPct + assumptions.insurancePct + assumptions.maintenancePct);

  // 1% rule: monthly rent * 100
  const maxPriceByOnePercent = monthlyRent * 100;

  // How far listing price is above/below the cap rate max (negative = overpriced)
  const listingPriceVsMaxCapRate = maxPriceByCapRate - price;

  return {
    purchasePrice: price,
    downPayment,
    loanAmount,
    closingCosts,
    totalCashInvested,
    monthlyMortgage,
    monthlyRent,
    monthlyVacancyLoss,
    effectiveMonthlyRent,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyMaintenance,
    monthlyManagement,
    monthlyCapEx,
    totalMonthlyExpenses,
    monthlyNOI,
    monthlyCashFlow,
    annualGrossRent,
    annualEffectiveRent,
    annualExpenses,
    annualNOI,
    annualDebtService,
    annualCashFlow,
    capRate,
    cashOnCash,
    grm,
    dscr,
    maxPriceByCapRate,
    maxPriceByOnePercent,
    listingPriceVsMaxCapRate,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
