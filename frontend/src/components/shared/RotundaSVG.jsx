export default function RotundaSVG({ className }) {
  const solid  = 'rgba(255,255,255,0.92)';
  const mid    = 'rgba(255,255,255,0.50)';
  const faint  = 'rgba(255,255,255,0.08)';

  const cols = [76, 106, 136, 164, 194, 224];

  return (
    <svg
      viewBox="0 0 300 272"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="UVA Rotunda illustration"
    >
      {/* ── Lantern ── */}
      <ellipse cx="150" cy="19" rx="9" ry="4" fill={solid} />
      <rect x="141" y="19" width="18" height="22" rx="2" fill={solid} />

      {/* ── Dome ribs (subtle depth lines) ── */}
      <path d="M 110 93 Q 150 64 190 93" stroke={mid} strokeWidth="0.8" />
      <path d="M 100 93 Q 150 52 200 93" stroke={mid} strokeWidth="0.9" />
      <path d="M 91  93 Q 150 36 209 93" stroke={mid} strokeWidth="1.0" />

      {/* ── Dome main shape ── */}
      <path d="M 91 93 Q 150 28 209 93 Z" stroke={solid} strokeWidth="2" fill={faint} />

      {/* ── Dome base ring ── */}
      <rect x="88" y="91" width="124" height="11" rx="1" fill={solid} />

      {/* ── Drum (cylindrical building body) ── */}
      <rect x="91" y="102" width="118" height="47" fill={faint} stroke={solid} strokeWidth="1.5" />

      {/* ── Drum arched windows (3) ── */}
      {[113, 150, 187].map((cx) => (
        <path
          key={cx}
          d={`M ${cx - 8},144 L ${cx - 8},120 A 8,8 0 0 1 ${cx + 8},120 L ${cx + 8},144 Z`}
          fill={mid}
        />
      ))}

      {/* ── Entablature ── */}
      <rect x="58" y="149" width="184" height="13" rx="1" fill={solid} />

      {/* ── Pediment ── */}
      <polygon points="58,149 242,149 150,110" fill={faint} stroke={solid} strokeWidth="1.5" />

      {/* ── Columns (6 — hexastyle) ── */}
      {cols.map((cx) => (
        <g key={cx}>
          <rect x={cx - 6} y="162" width="12" height="5"  fill={solid} rx="0.5" />
          <rect x={cx - 4} y="167" width="8"   height="57" fill={solid} rx="1"   />
          <rect x={cx - 6} y="224" width="12" height="5"  fill={solid} rx="0.5" />
        </g>
      ))}

      {/* ── Stylobate ── */}
      <rect x="56" y="229" width="188" height="9" rx="1" fill={solid} />

      {/* ── Steps (fade out toward ground) ── */}
      <rect x="42"  y="238" width="216" height="7" rx="1" fill={solid} opacity="0.80" />
      <rect x="28"  y="245" width="244" height="7" rx="1" fill={solid} opacity="0.58" />
      <rect x="14"  y="252" width="272" height="7" rx="1" fill={solid} opacity="0.36" />
    </svg>
  );
}
