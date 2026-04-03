import { useState, useCallback } from 'react';
import type { InvestmentAssumptions } from '@/types';

const DEFAULTS: InvestmentAssumptions = {
  downPaymentPct: 0.25,
  interestRate: 7.5,
  loanTermYears: 30,
  propertyTaxPct: 0.0075,
  insurancePct: 0.005,
  maintenancePct: 0.01,
  vacancyPct: 0.05,
  managementPct: 0.08,
  capexPct: 0.05,
  closingCostPct: 0.03,
  targetCapRate: 6,
};

const STORAGE_KEY = 'br_assumptions';

function loadFromStorage(): InvestmentAssumptions {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULTS;
}

export function useAssumptions() {
  const [assumptions, setAssumptions] = useState<InvestmentAssumptions>(loadFromStorage);

  const updateAssumption = useCallback(<K extends keyof InvestmentAssumptions>(
    key: K,
    value: InvestmentAssumptions[K]
  ) => {
    setAssumptions(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetAssumptions = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAssumptions(DEFAULTS);
  }, []);

  return { assumptions, updateAssumption, resetAssumptions };
}
