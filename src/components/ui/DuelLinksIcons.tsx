export function DuelLinksSkillIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id="dlSkillOrb" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF566" />
          <stop offset="55%" stopColor="#FFD000" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <filter id="dlSparkShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1.5" dy="2" stdDeviation="1.5" floodColor="#B45309" floodOpacity="0.45" />
        </filter>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="url(#dlSkillOrb)"
        stroke="#0F172A"
        strokeWidth="3.5"
      />
      <path
        d="M32 10 C34.5 24, 40 29.5, 54 32 C40 34.5, 34.5 40, 32 54 C29.5 40, 24 34.5, 10 32 C24 29.5, 29.5 24, 32 10 Z"
        fill="#FFFFFF"
        filter="url(#dlSparkShadow)"
      />
    </svg>
  );
}

export function DuelLinksGemIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="dlGemBody" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="30%" stopColor="#34D399" />
          <stop offset="65%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <radialGradient id="dlGemCore" cx="50%" cy="48%" r="45%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#67E8F9" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {/* Contorno hexagonal de la gema */}
      <polygon
        points="24,6 48,12 58,34 40,58 16,52 6,30"
        fill="url(#dlGemBody)"
        stroke="#090D16"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Faceta interior */}
      <polygon
        points="26,16 42,20 48,34 36,48 20,44 14,30"
        fill="url(#dlGemCore)"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Aristas blancas de brillo */}
      <line x1="24" y1="6" x2="26" y2="16" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="48" y1="12" x2="42" y2="20" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="58" y1="34" x2="48" y2="34" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="40" y1="58" x2="36" y2="48" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="16" y1="52" x2="20" y2="44" stroke="#FFFFFF" strokeWidth="2" />
      <line x1="6" y1="30" x2="14" y2="30" stroke="#FFFFFF" strokeWidth="2" />
      {/* Destello central */}
      <circle cx="31" cy="31" r="6" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
