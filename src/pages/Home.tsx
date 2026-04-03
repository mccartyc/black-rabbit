import { useState } from 'react';
import type { RentCastListing } from '@/types';
import { useListings } from '@/hooks/useListings';
import { useAssumptions } from '@/hooks/useAssumptions';
import { useApiCallTracker } from '@/hooks/useApiCallTracker';
import { SearchBar } from '@/components/SearchBar';
import { PropertyCard } from '@/components/PropertyCard';
import { InvestmentModal } from '@/components/InvestmentModal';
import { AssumptionsPanel } from '@/components/AssumptionsPanel';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

const DEFAULT_ZIP = '83686';


export function Home() {
  const [zipCode, setZipCode] = useState(DEFAULT_ZIP);
  const [selectedListing, setSelectedListing] = useState<RentCastListing | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const { assumptions, updateAssumption, resetAssumptions } = useAssumptions();
  const { data: listings, isLoading, error, isFetching } = useListings(zipCode);
  const { data: callStats, refetch: refetchCallCount } = useApiCallTracker();

  const callCount = callStats?.count ?? 0;
  const callLimit = callStats?.limit ?? 50;
  const callWarning = (callStats?.remaining ?? 50) <= 10;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(13,13,13,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
            <span style={{ fontSize: 22 }}>🐇</span>
            <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--accent)', letterSpacing: '-0.3px' }}>Black Rabbit</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 6, borderLeft: '1px solid var(--border)' }}>
              Real Estate Analyzer
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* API call counter */}
            <div
              title={`${callCount} of ${callLimit} RentCast API calls used this month. Calls are cached — same property/zip won't count again.`}
              style={{
                fontSize: 11,
                color: callWarning ? 'var(--warning)' : 'var(--text-muted)',
                background: callWarning ? 'var(--warning-dim)' : 'transparent',
                border: `1px solid ${callWarning ? 'rgba(224,160,64,0.3)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                whiteSpace: 'nowrap',
                cursor: 'default',
              }}
            >
              {callCount}/{callLimit} calls
            </div>
            <SearchBar
              defaultZip={zipCode}
              onSearch={setZipCode}
              isLoading={isLoading || isFetching}
            />
            <button
              onClick={() => setShowAssumptions(true)}
              style={{
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius)',
                color: 'var(--accent)',
                padding: '8px 14px',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              ⚙ Assumptions
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        <>
          {/* Status bar */}
            {listings && !isLoading && (
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{listings.length}</span> active listings in{' '}
                  <span style={{ color: 'var(--accent)' }}>{zipCode}</span>
                </span>
                {listings.length > 0 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Rent estimates load per property — click any card for full analysis
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {(isLoading || isFetching) && (
              <LoadingSpinner message={`Searching MLS listings in ${zipCode}…`} />
            )}

            {/* Error */}
            {error && !isLoading && (
              <ErrorMessage
                title="Failed to fetch listings"
                message={(error as { response?: { data?: { error?: string } } }).response?.data?.error ?? (error as Error).message ?? 'An unknown error occurred.'}
              />
            )}

            {/* Empty state */}
            {listings && listings.length === 0 && !isLoading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🏘</p>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>No active listings found</p>
                <p style={{ fontSize: 13 }}>Try a different zip code or check back later.</p>
              </div>
            )}

            {/* Property Grid */}
            {listings && listings.length > 0 && !isLoading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 16,
              }}>
                {listings.map(listing => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing}
                    assumptions={assumptions}
                    onSelect={setSelectedListing}
                  />
                ))}
              </div>
            )}
        </>
      </main>

      {/* Investment Detail Modal */}
      {selectedListing && (
        <InvestmentModal
          listing={selectedListing}
          assumptions={assumptions}
          onClose={() => { setSelectedListing(null); void refetchCallCount(); }}
        />
      )}

      {/* Assumptions Panel */}
      {showAssumptions && (
        <AssumptionsPanel
          assumptions={assumptions}
          onUpdate={updateAssumption}
          onReset={resetAssumptions}
          onClose={() => setShowAssumptions(false)}
        />
      )}
    </div>
  );
}
