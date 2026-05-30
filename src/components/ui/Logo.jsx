export function CerebraIcon({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="12" fill="#7C6FF7" />
      <path
        d="M12 20 C12 14.477 16.477 10 22 10 C25.5 10 28.5 11.8 30 14.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 20 C28 25.523 23.523 30 18 30 C14.5 30 11.5 28.2 10 25.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="20" r="2.5" fill="white" />
      <circle cx="20" cy="20" r="1.2" fill="#7C6FF7" />
    </svg>
  );
}

export function CerebraWordmark({ height = 28, className = "", dark = false }) {
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
        cerebra
      </text>
    </svg>
  );
}

export function CerebraLockup({ height = 32, className = "", dark = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <CerebraIcon size={height} />
      <CerebraWordmark height={height * 0.75} dark={dark} />
    </div>
  );
}
