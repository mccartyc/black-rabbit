import type { CSSProperties } from 'react';
import type { InvestmentAssumptions } from '@/types';

interface Props {
  assumptions: InvestmentAssumptions;
  onUpdate: <K extends keyof InvestmentAssumptions>(key: K, value: InvestmentAssumptions[K]) => void;
  onReset: () => void;
  onClose: () => void;
}

interface FieldConfig {
  key: keyof InvestmentAssumptions;
  label: string;
  isPercent: boolean;
  step: number;
  min: number;
  max: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'downPaymentPct', label: 'Down Payment', isPercent: true, step: 1, min: 0, max: 100 },
  { key: 'interestRate', label: 'Interest Rate', isPercent: false, step: 0.25, min: 0, max: 20 },
  { key: 'loanTermYears', label: 'Loan Term (years)', isPercent: false, step: 5, min: 5, max: 30 },
  { key: 'closingCostPct', label: 'Closing Costs', isPercent: true, step: 0.5, min: 0, max: 10 },
  { key: 'propertyTaxPct', label: 'Property Tax (annual)', isPercent: true, step: 0.1, min: 0, max: 5 },
  { key: 'insurancePct', label: 'Insurance (annual)', isPercent: true, step: 0.1, min: 0, max: 3 },
  { key: 'maintenancePct', label: 'Maintenance (annual)', isPercent: true, step: 0.25, min: 0, max: 5 },
  { key: 'vacancyPct', label: 'Vacancy Rate', isPercent: true, step: 1, min: 0, max: 30 },
  { key: 'managementPct', label: 'Mgmt Fee (of rent)', isPercent: true, step: 1, min: 0, max: 20 },
  { key: 'capexPct', label: 'CapEx Reserve (of rent)', isPercent: true, step: 1, min: 0, max: 20 },
];

const inputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  padding: '6px 10px',
  fontSize: 13,
  outline: 'none',
  textAlign: 'right',
};

export function AssumptionsPanel({ assumptions, onUpdate, onReset, onClose }: Props) {
  function getValue(field: FieldConfig): number {
    const raw = assumptions[field.key] as number;
    return field.isPercent ? raw * 100 : raw;
  }

  function handleChange(field: FieldConfig, raw: string) {
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) return;
    const stored = field.isPercent ? parsed / 100 : parsed;
    onUpdate(field.key, stored as InvestmentAssumptions[typeof field.key]);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
      />

      {/* Panel */}
      <div style={{
        position: 'relative',
        width: 320,
        height: '100vh',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        overflowY: 'auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>Assumptions</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -12 }}>
          Changes apply instantly to all properties.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FIELDS.map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {field.label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  value={getValue(field)}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  onChange={e => handleChange(field, e.target.value)}
                  style={inputStyle}
                />
                {field.isPercent && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, minWidth: 16 }}>%</span>
                )}
                {!field.isPercent && field.key === 'interestRate' && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, minWidth: 16 }}>%</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          style={{
            marginTop: 'auto',
            background: 'transparent',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
