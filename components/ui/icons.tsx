type IconProps = { className?: string };

// Ícone "th" (grade 3x3 preenchida) usado nos títulos de seção.
export function GridIcon({ className }: IconProps) {
  const cells = [0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => ({ row, col })));
  return (
    <svg viewBox="0 0 22 18" className={className} aria-hidden="true">
      {cells.map(({ row, col }) => (
        <rect key={`${row}-${col}`} x={col * 7.5} y={row * 6.25} width="6.5" height="5.25" fill="currentColor" />
      ))}
    </svg>
  );
}

// Silhueta sólida de usuário (avatar padrão do sistema).
export function SilhouetteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="5" fill="currentColor" />
      <path d="M2 24c0-6.2 4.5-9.6 10-9.6S22 17.8 22 24z" fill="currentColor" />
    </svg>
  );
}

export function PersonShape({ className }: IconProps) {
  return (
    <svg viewBox="0 0 70 80" className={className} aria-hidden="true">
      <circle cx="35" cy="20" r="19" fill="currentColor" />
      <path d="M0 80V64c0-12 9-21 21-21h28c12 0 21 9 21 21v16z" fill="currentColor" />
    </svg>
  );
}

export function ArrowCircleRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" fill="currentColor" />
      <path d="M4 7h4.6L6.8 5.2 8 4l4 4-4 4-1.2-1.2L8.6 9H4z" fill="var(--color-siga-aqua)" />
    </svg>
  );
}
