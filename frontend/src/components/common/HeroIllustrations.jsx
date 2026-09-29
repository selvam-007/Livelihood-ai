import React from 'react';

export function TravelerHeroIllustration({ className = "w-full h-full" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 540 280" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#99f6e4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d1fae5" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="hill1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="hill2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="hill3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
        <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Sky backdrop */}
      <rect width="540" height="280" rx="16" fill="url(#skyGrad)" />

      {/* Rising Sun */}
      <circle cx="360" cy="90" r="38" fill="url(#sunGlow)" filter="url(#softGlow)" opacity="0.9" />
      <circle cx="360" cy="90" r="24" fill="#ffffff" opacity="0.85" />

      {/* Distant Hills */}
      <path d="M120 280 C 220 160, 340 180, 540 220 L 540 280 Z" fill="url(#hill3)" opacity="0.7" />
      <path d="M0 280 C 140 170, 280 190, 480 280 Z" fill="url(#hill2)" opacity="0.8" />
      <path d="M220 280 C 330 195, 420 200, 540 250 L 540 280 Z" fill="url(#hill1)" opacity="0.9" />

      {/* Winding Pathway */}
      <path 
        d="M170 280 C 220 250, 270 240, 310 215 C 345 195, 360 170, 385 160" 
        stroke="url(#pathGrad)" 
        strokeWidth="24" 
        strokeLinecap="round" 
        opacity="0.9" 
      />
      <path 
        d="M170 280 C 220 250, 270 240, 310 215 C 345 195, 360 170, 385 160" 
        stroke="#ffffff" 
        strokeWidth="3" 
        strokeDasharray="6 6" 
        strokeLinecap="round" 
        opacity="0.8" 
      />

      {/* Directional Signpost */}
      <g transform="translate(370, 140)">
        {/* Post */}
        <rect x="18" y="0" width="6" height="85" rx="3" fill="#0f766e" />
        {/* Arrow 1: Skills */}
        <path d="M4 12 L38 12 L46 20 L38 28 L4 28 Z" fill="#0284c7" />
        <text x="12" y="23" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">SKILLS</text>
        {/* Arrow 2: Career */}
        <path d="M38 35 L4 35 L-4 43 L4 51 L38 51 Z" fill="#059669" />
        <text x="6" y="46" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">CAREER</text>
      </g>

      {/* Traveler Silhouette with Backpack */}
      <g transform="translate(230, 140)">
        {/* Shadow */}
        <ellipse cx="25" cy="115" rx="18" ry="5" fill="#064e3b" opacity="0.3" />
        {/* Legs */}
        <path d="M19 82 L15 112 L20 114" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 82 L34 112 L40 114" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Torso & Shirt */}
        <path d="M16 42 Q 25 38 34 42 L 36 82 L 14 82 Z" fill="#0284c7" />
        {/* Backpack */}
        <rect x="6" y="44" width="13" height="26" rx="5" fill="#047857" />
        <rect x="8" y="48" width="9" height="8" rx="2" fill="#059669" />
        {/* Head & Cap */}
        <circle cx="25" cy="27" r="9" fill="#fed7aa" />
        <path d="M16 25 Q 26 15 35 22 L 38 25 Z" fill="#1e293b" />
        {/* Arm looking forward */}
        <path d="M33 46 Q 42 56 46 64" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
        <circle cx="47" cy="65" r="3" fill="#fed7aa" />
      </g>
    </svg>
  );
}

export function MountainSummitIllustration({ className = "w-full h-full" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 320 220" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mtnGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mtnBack" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Sun glow */}
      <circle cx="160" cy="55" r="32" fill="url(#sun)" opacity="0.85" />
      <circle cx="160" cy="55" r="22" fill="#ffffff" opacity="0.9" />

      {/* Background Peaks */}
      <polygon points="60,220 120,95 180,220" fill="url(#mtnBack)" opacity="0.5" />
      <polygon points="150,220 220,110 290,220" fill="url(#mtnBack)" opacity="0.6" />

      {/* Main Mountain */}
      <polygon points="40,220 160,50 280,220" fill="url(#mtnGrad)" />

      {/* Snowcap */}
      <polygon points="135,85 160,50 185,85 170,80 160,88 150,80" fill="#ffffff" />

      {/* Path to Peak */}
      <path 
        d="M80 220 C 110 190, 140 170, 145 140 C 150 115, 155 90, 160 55" 
        stroke="#fef08a" 
        strokeWidth="3.5" 
        strokeDasharray="4 4" 
        strokeLinecap="round" 
      />

      {/* Flag at Summit */}
      <line x1="160" y1="50" x2="160" y2="28" stroke="#ffffff" strokeWidth="2.5" />
      <polygon points="160,28 185,36 160,44" fill="#ef4444" />

      {/* Stars/Sparkles */}
      <circle cx="70" cy="40" r="2" fill="#38bdf8" />
      <circle cx="250" cy="45" r="2" fill="#38bdf8" />
      <circle cx="220" cy="25" r="1.5" fill="#fef08a" />
    </svg>
  );
}

export function AuthHeroIllustration({ className = "w-full h-full" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 460 360" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="authSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="neonPath" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <filter id="authGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="460" height="360" rx="20" fill="url(#authSky)" />

      {/* Distant Glowing Moon / Sun */}
      <circle cx="340" cy="110" r="45" fill="#38bdf8" filter="url(#authGlow)" opacity="0.4" />
      <circle cx="340" cy="110" r="30" fill="#f8fafc" opacity="0.8" />

      {/* Winding glowing road */}
      <path 
        d="M120 360 C 160 300, 200 280, 250 240 C 290 205, 310 170, 340 120" 
        stroke="url(#neonPath)" 
        strokeWidth="28" 
        strokeLinecap="round" 
        filter="url(#authGlow)" 
        opacity="0.85" 
      />
      <path 
        d="M120 360 C 160 300, 200 280, 250 240 C 290 205, 310 170, 340 120" 
        stroke="#ffffff" 
        strokeWidth="3" 
        strokeDasharray="8 8" 
        strokeLinecap="round" 
      />

      {/* Soundwave Mic rings */}
      <g transform="translate(120, 240)">
        <circle cx="0" cy="0" r="50" stroke="#38bdf8" strokeWidth="1.5" opacity="0.3" />
        <circle cx="0" cy="0" r="35" stroke="#818cf8" strokeWidth="2" opacity="0.6" />
        <circle cx="0" cy="0" r="22" fill="#2563eb" filter="url(#authGlow)" />
        {/* Mic icon inside */}
        <path d="M-4 -8 C-4 -10 -2 -12 0 -12 C2 -12 4 -10 4 -8 L4 0 C4 2 2 4 0 4 C-2 4 -4 2 -4 0 Z" fill="#ffffff" />
        <path d="M-7 -2 C-7 4 -3 7 0 7 C3 7 7 4 7 -2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="7" x2="0" y2="12" stroke="#ffffff" strokeWidth="2" />
      </g>

      {/* Target flag on top */}
      <g transform="translate(340, 110)">
        <line x1="0" y1="0" x2="0" y2="-28" stroke="#ffffff" strokeWidth="3" />
        <polygon points="0,-28 22,-20 0,-12" fill="#10b981" />
      </g>
    </svg>
  );
}
