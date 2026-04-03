import React, { useState } from 'react';

interface Props {
  defaultZip: string;
  onSearch: (zip: string) => void;
  isLoading: boolean;
}

export function SearchBar({ defaultZip, onSearch, isLoading }: Props) {
  const [value, setValue] = useState(defaultZip);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = value.trim();
    if (clean.length === 5) onSearch(clean);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: '0 0 auto' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none',
        }}>
          ⌖
        </span>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="Zip Code"
          maxLength={5}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-primary)',
            padding: '9px 12px 9px 32px',
            fontSize: 14,
            width: 140,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-light)')}
        />
      </div>
      <button
        type="submit"
        disabled={value.length !== 5 || isLoading}
        style={{
          background: 'var(--accent)',
          color: '#0D0D0D',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '9px 20px',
          fontWeight: 600,
          fontSize: 14,
          cursor: value.length !== 5 || isLoading ? 'not-allowed' : 'pointer',
          opacity: value.length !== 5 || isLoading ? 0.5 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
