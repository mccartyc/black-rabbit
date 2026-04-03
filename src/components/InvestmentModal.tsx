import type { ReactNode } from 'react';
import type { RentCastListing, InvestmentAssumptions } from '@/types';
import { useRentEstimate } from '@/hooks/useRentEstimate';
import { calculateMetrics, formatCurrency, formatPercent } from '@/utils';
import { MetricBadge } from './MetricBadge';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  listing: RentCastListing;
  assumptions: InvestmentAssumptions;
  onClose: () => void;
}

function tone(value: number, good: number, ok: number): 'positive' | 'warning' | 'negative' {
  if (value >= good) return 'positive';
  if (value >= ok) return 'warning';
  return 'negative';
}

function Row({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 600 : 400, color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

export function InvestmentModal({ listing, assumptions, onClose }: Props) {
  const { data: rentEstimate, isLoading, error } = useRentEstimate(listing);
  const metrics = rentEstimate ? calculateMetrics(listing, rentEstimate, assumptions) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />

      {/* Modal */}
      <div style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        width: '100%',
        maxWidth: 680,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{listing.addressLine1}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {listing.city}, {listing.state} {listing.zipCode}
              {listing.mlsName && <span style={{ marginLeft: 10, color: 'var(--text-muted)' }}>MLS: {listing.mlsName}</span>}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {isLoading && <LoadingSpinner message="Fetching rental estimate…" />}

        {error && (
          <div style={{ padding: '16px', background: 'var(--negative-dim)', borderRadius: 'var(--radius)', marginBottom: 20, fontSize: 13, color: 'var(--negative)' }}>
            Unable to fetch rental estimate. Metrics cannot be calculated.
          </div>
        )}

        {metrics && rentEstimate && (
          <>
            {/* Key Metrics Row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
              <MetricBadge label="Cap Rate" value={formatPercent(metrics.capRate)} tone={tone(metrics.capRate, 6, 4)} large />
              <MetricBadge label="Cash on Cash" value={formatPercent(metrics.cashOnCash)} tone={tone(metrics.cashOnCash, 8, 4)} large />
              <MetricBadge label="Mo. Cash Flow" value={formatCurrency(metrics.monthlyCashFlow)} tone={metrics.monthlyCashFlow >= 200 ? 'positive' : metrics.monthlyCashFlow >= 0 ? 'warning' : 'negative'} large />
              {metrics.dscr !== null && (
                <MetricBadge label="DSCR" value={metrics.dscr.toFixed(2)} tone={tone(metrics.dscr, 1.25, 1.0)} large />
              )}
              {metrics.grm !== null && (
                <MetricBadge label="GRM" value={metrics.grm.toFixed(1)} tone="neutral" large />
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <Section title="Purchase & Financing">
                  <Row label="Purchase Price" value={formatCurrency(metrics.purchasePrice)} highlight />
                  <Row label="Down Payment" value={`${formatCurrency(metrics.downPayment)} (${formatPercent(assumptions.downPaymentPct * 100, 0)})`} />
                  <Row label="Loan Amount" value={formatCurrency(metrics.loanAmount)} />
                  <Row label="Closing Costs" value={formatCurrency(metrics.closingCosts)} />
                  <Row label="Total Cash Invested" value={formatCurrency(metrics.totalCashInvested)} highlight />
                  <Row label="Monthly Mortgage (P&I)" value={formatCurrency(metrics.monthlyMortgage)} />
                </Section>

                <Section title="Income (Monthly)">
                  <Row label="Gross Rent (Estimate)" value={formatCurrency(metrics.monthlyRent)} />
                  <Row label="Rent Range" value={`${formatCurrency(rentEstimate.rentRangeLow)} – ${formatCurrency(rentEstimate.rentRangeHigh)}`} />
                  <Row label="Vacancy Loss" value={`-${formatCurrency(metrics.monthlyVacancyLoss)}`} />
                  <Row label="Effective Rent" value={formatCurrency(metrics.effectiveMonthlyRent)} highlight />
                </Section>
              </div>

              <div>
                <Section title="Operating Expenses (Monthly)">
                  <Row label="Property Tax" value={formatCurrency(metrics.monthlyPropertyTax)} />
                  <Row label="Insurance" value={formatCurrency(metrics.monthlyInsurance)} />
                  <Row label="Maintenance" value={formatCurrency(metrics.monthlyMaintenance)} />
                  <Row label="Mgmt Fee" value={formatCurrency(metrics.monthlyManagement)} />
                  <Row label="CapEx Reserve" value={formatCurrency(metrics.monthlyCapEx)} />
                  <Row label="Total Expenses" value={formatCurrency(metrics.totalMonthlyExpenses)} highlight />
                </Section>

                <Section title="Returns (Annual)">
                  <Row label="Gross Rent" value={formatCurrency(metrics.annualGrossRent)} />
                  <Row label="NOI" value={formatCurrency(metrics.annualNOI)} highlight />
                  <Row label="Debt Service" value={`-${formatCurrency(metrics.annualDebtService)}`} />
                  <Row label="Net Cash Flow" value={formatCurrency(metrics.annualCashFlow)} highlight />
                  <Row label="Cap Rate" value={formatPercent(metrics.capRate)} />
                  <Row label="Cash on Cash" value={formatPercent(metrics.cashOnCash)} />
                </Section>

                <Section title="Max Purchase Price">
                  <Row
                    label={`Target Cap Rate (${formatPercent(assumptions.targetCapRate, 1)})`}
                    value={formatCurrency(metrics.maxPriceByCapRate)}
                    highlight
                  />
                  <Row
                    label="1% Rule (rent × 100)"
                    value={formatCurrency(metrics.maxPriceByOnePercent)}
                  />
                  <div style={{
                    marginTop: 8,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: metrics.listingPriceVsMaxCapRate >= 0 ? 'var(--positive-dim)' : 'var(--negative-dim)',
                    border: `1px solid ${metrics.listingPriceVsMaxCapRate >= 0 ? 'rgba(76,175,125,0.25)' : 'rgba(224,87,87,0.25)'}`,
                    fontSize: 12,
                    color: metrics.listingPriceVsMaxCapRate >= 0 ? 'var(--positive)' : 'var(--negative)',
                  }}>
                    {metrics.listingPriceVsMaxCapRate >= 0
                      ? `Listed ${formatCurrency(metrics.listingPriceVsMaxCapRate)} under your max — potential deal`
                      : `Listed ${formatCurrency(Math.abs(metrics.listingPriceVsMaxCapRate))} over your max — needs negotiation`
                    }
                  </div>
                </Section>
              </div>
            </div>

            {/* Property Details */}
            <Section title="Property Details">
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 4 }}>
                {(
                  [
                    { label: 'Beds', value: listing.bedrooms },
                    { label: 'Baths', value: listing.bathrooms },
                    ...(listing.squareFootage ? [{ label: 'Sq Ft', value: listing.squareFootage.toLocaleString() }] : []),
                    ...(listing.yearBuilt ? [{ label: 'Year Built', value: listing.yearBuilt }] : []),
                    ...(listing.lotSize ? [{ label: 'Lot Size', value: `${listing.lotSize.toLocaleString()} sqft` }] : []),
                    ...(listing.hoa ? [{ label: 'HOA/mo', value: formatCurrency(listing.hoa) }] : []),
                    ...(listing.daysOnMarket !== undefined ? [{ label: 'Days on Market', value: listing.daysOnMarket }] : []),
                  ] as { label: string; value: string | number }[]
                ).map((item) => (
                  <div key={item.label} style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
