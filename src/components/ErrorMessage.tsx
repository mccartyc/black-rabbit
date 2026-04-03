interface Props {
  title?: string;
  message: string;
}

export function ErrorMessage({ title = 'Error', message }: Props) {
  return (
    <div style={{
      margin: '24px auto',
      maxWidth: 480,
      padding: '16px 20px',
      background: 'var(--negative-dim)',
      border: '1px solid var(--negative)',
      borderRadius: 'var(--radius)',
      color: 'var(--text-primary)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--negative)' }}>{title}</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{message}</p>
    </div>
  );
}
