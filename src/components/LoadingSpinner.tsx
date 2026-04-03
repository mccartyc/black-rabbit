interface Props {
  size?: number;
  message?: string;
}

export function LoadingSpinner({ size = 32, message }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="10" stroke="var(--border-light)" strokeWidth="2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {message && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{message}</p>}
    </div>
  );
}
