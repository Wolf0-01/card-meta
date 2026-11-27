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
          <feDropShadow
            dx="1.5"
            dy="2"
            stdDeviation="1.5"
            floodColor="#B45309"
            floodOpacity="0.45"
          />
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
  className = "h-6 w-6",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        {/* Faceta superior amarilla-verde */}
        <linearGradient id="gemTop" x1="25" y1="12" x2="68" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>

        {/* Faceta superior derecha verde-cian */}
        <linearGradient id="gemTopRight" x1="65" y1="14" x2="88" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="60%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Faceta inferior derecha azul-morado */}
        <linearGradient id="gemBottomRight" x1="86" y1="46" x2="62" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="55%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* Faceta inferior morada profunda */}
        <linearGradient id="gemBottom" x1="62" y1="84" x2="22" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#311042" />
          <stop offset="50%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#A21CAF" />
        </linearGradient>

        {/* Faceta inferior izquierda magenta-rosa */}
        <linearGradient id="gemBottomLeft" x1="22" y1="74" x2="12" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C026D3" />
          <stop offset="60%" stopColor="#E879F9" />
          <stop offset="100%" stopColor="#F5D0FE" />
        </linearGradient>

        {/* Faceta superior izquierda blanco-lavanda */}
        <linearGradient id="gemTopLeft" x1="12" y1="42" x2="32" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3E8FF" />
          <stop offset="55%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#ECFCCB" />
        </linearGradient>

        {/* Núcleo cósmico central */}
        <radialGradient id="gemCenter" cx="48%" cy="48%" r="52%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="28%" stopColor="#CFFAFE" />
          <stop offset="58%" stopColor="#22D3EE" />
          <stop offset="82%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#581C87" />
        </radialGradient>
      </defs>

      {/* Silueta exterior con borde negro grueso tipo Duel Links */}
      <polygon
        points="32,12 66,14 86,44 66,80 58,86 24,78 12,44"
        fill="#090D16"
        stroke="#090D16"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Base 3D inferior oscura */}
      <polygon
        points="66,80 58,86 24,78 28,72 60,74"
        fill="#1E1035"
      />
      <polygon
        points="86,44 66,80 60,74 79,43"
        fill="#0F172A"
      />

      {/* Biseles exteriores coloreados */}
      <polygon points="32,12 66,14 58,24 35,23" fill="url(#gemTop)" />
      <polygon points="66,14 86,44 74,45 58,24" fill="url(#gemTopRight)" />
      <polygon points="86,44 63,76 55,66 74,45" fill="url(#gemBottomRight)" />
      <polygon points="63,76 24,78 31,66 55,66" fill="url(#gemBottom)" />
      <polygon points="24,78 12,44 24,45 31,66" fill="url(#gemBottomLeft)" />
      <polygon points="12,44 32,12 35,23 24,45" fill="url(#gemTopLeft)" />

      {/* Mesa central luminosa */}
      <polygon
        points="35,23 58,24 74,45 55,66 31,66 24,45"
        fill="url(#gemCenter)"
      />

      {/* Líneas blancas nítidas de facetas */}
      <polygon
        points="35,23 58,24 74,45 55,66 31,66 24,45"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <line x1="32" y1="12" x2="35" y2="23" stroke="#FFFFFF" strokeWidth="2.2" />
      <line x1="66" y1="14" x2="58" y2="24" stroke="#FFFFFF" strokeWidth="2.2" />
      <line x1="86" y1="44" x2="74" y2="45" stroke="#FFFFFF" strokeWidth="2.2" />
      <line x1="63" y1="76" x2="55" y2="66" stroke="#FFFFFF" strokeWidth="2.2" />
      <line x1="24" y1="78" x2="31" y2="66" stroke="#FFFFFF" strokeWidth="2.2" />
      <line x1="12" y1="44" x2="24" y2="45" stroke="#FFFFFF" strokeWidth="2.2" />

      {/* Destellos internos */}
      <circle cx="47" cy="45" r="10" fill="#FFFFFF" opacity="0.88" />
      <circle cx="33" cy="54" r="1.6" fill="#FFFFFF" opacity="0.9" />
      <circle cx="62" cy="36" r="1.4" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}
