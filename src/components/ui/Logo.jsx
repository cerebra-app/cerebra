export function ThalaIcon({ size = 48, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="skewX(-20.03)">
        <rect x="49.1" y="16.8" width="40.4" height="39.8" rx="4" fill="#2960F1" />
        <rect x="94.6" y="35.8" width="24.0" height="20.8" rx="2.2" fill="#2960F1" />
        <rect x="79.9" y="61.1" width="39.5" height="35.4" rx="3.6" fill="#2960F1" />
        <rect x="51.6" y="61.2" width="24.0" height="19.2" rx="2" fill="#2960F1" />
      </g>
    </svg>
  );
}

export function ThalaWordmark({ height = 28, className = "", dark = false }) {
  return (
    <svg
      height={height}
      viewBox="0 0 120 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="0"
        y="22"
        fontFamily="Sora, sans-serif"
        fontSize="22"
        fontWeight="600"
        fill={dark ? "#ffffff" : "#1E293B"}
        letterSpacing="-0.5"
      >
        thala
      </text>
    </svg>
  );
}

export function ThalaLockup({ height = 32, className = "", dark = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ThalaIcon size={height} />
      <ThalaWordmark height={height * 0.75} dark={dark} />
    </div>
  );
}
