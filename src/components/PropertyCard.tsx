import { useState } from 'react';
import type { RentCastListing, InvestmentAssumptions } from '@/types';
import { formatCurrency } from '@/utils';

interface Props {
  listing: RentCastListing;
  assumptions: InvestmentAssumptions;
  onSelect: (listing: RentCastListing) => void;
}

export function PropertyCard({ listing, assumptions: _assumptions, onSelect }: Props) {
  const [hovered, setHovered] = useState(false);

  const pricePerSqft =
    listing.squareFootage && listing.squareFootage > 0
      ? Math.round(listing.price / listing.squareFootage)
      : null;

  return (
    <div
      onClick={() => onSelect(listing)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-elevated)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 3 }}>
            {listing.addressLine1}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {listing.city}, {listing.state} {listing.zipCode}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
            {formatCurrency(listing.price)}
          </p>
          {listing.daysOnMarket !== undefined && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {listing.daysOnMarket}d on market
            </p>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        <span>{listing.bedrooms} bd</span>
        <span>{listing.bathrooms} ba</span>
        {listing.squareFootage && <span>{listing.squareFootage.toLocaleString()} sqft</span>}
        {pricePerSqft && <span>${pricePerSqft}/sqft</span>}
        {listing.yearBuilt && <span>Built {listing.yearBuilt}</span>}
        <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{listing.propertyType}</span>
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTop: '1px solid var(--border)',
        fontSize: 12,
      }}>
        {listing.mlsName ? (
          <span style={{ color: 'var(--text-muted)' }}>MLS: {listing.mlsName}{listing.mlsNumber ? ` #${listing.mlsNumber}` : ''}</span>
        ) : (
          <span />
        )}
        <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
          Analyze →
        </span>
      </div>
    </div>
  );
}
