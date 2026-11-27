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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/gem.png"
      alt="Gems"
      className={`object-contain ${className}`}
    />
  );
}
