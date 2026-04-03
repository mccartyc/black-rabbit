interface Props {
  label: string;
  value: string;
  tone: 'positive' | 'negative' | 'warning' | 'neutral';
  large?: boolean;
}

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  positive: { bg: 'var(--positive-dim)', text: 'var(--positive)', border: 'rgba(76,175,125,0.25)' },
  negative: { bg: 'var(--negative-dim)', text: 'var(--negative)', border: 'rgba(224,87,87,0.25)' },
  warning:  { bg: 'var(--warning-dim)',  text: 'var(--warning)',  border: 'rgba(224,160,64,0.25)' },
  neutral:  { bg: 'var(--bg-elevated)',  text: 'var(--text-secondary)', border: 'var(--border)' },
};

export function MetricBadge({ label, value, tone, large = false }: Props) {
  const colors = COLORS[tone] ?? COLORS.neutral;
  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 'var(--radius-sm)',
      padding: large ? '10px 14px' : '6px 10px',
      minWidth: large ? 110 : 90,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: large ? 18 : 14, fontWeight: 700, color: colors.text, letterSpacing: '-0.3px' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}
