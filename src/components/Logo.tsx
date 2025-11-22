interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle with Gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      {/* Main Circle */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

      {/* Financial Chart Line */}
      <path
        d="M 25 60 L 35 50 L 45 55 L 55 40 L 65 45 L 75 30"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Data Points */}
      <circle cx="35" cy="50" r="3" fill="white" />
      <circle cx="45" cy="55" r="3" fill="white" />
      <circle cx="55" cy="40" r="3" fill="white" />
      <circle cx="65" cy="45" r="3" fill="white" />
      <circle cx="75" cy="30" r="3" fill="url(#accentGradient)" />

      {/* AI Circuit Pattern */}
      <circle cx="50" cy="70" r="2" fill="white" opacity="0.8" />
      <circle cx="60" cy="70" r="1.5" fill="white" opacity="0.6" />
      <circle cx="40" cy="70" r="1.5" fill="white" opacity="0.6" />
      <line x1="50" y1="70" x2="60" y2="70" stroke="white" strokeWidth="1" opacity="0.6" />
      <line x1="50" y1="70" x2="40" y2="70" stroke="white" strokeWidth="1" opacity="0.6" />

      {/* Shield/Security Element */}
      <path
        d="M 50 15 L 55 17 L 55 23 Q 55 28 50 30 Q 45 28 45 23 L 45 17 Z"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M 50 18 L 52.5 19 L 52.5 23 Q 52.5 25.5 50 27 Q 47.5 25.5 47.5 23 L 47.5 19 Z"
        fill="url(#accentGradient)"
      />
    </svg>
  );
}

export function LogoText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={40} />
      <div>
        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
          FinSight X AI
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Enterprise Financial Intelligence
        </div>
      </div>
    </div>
  );
}
