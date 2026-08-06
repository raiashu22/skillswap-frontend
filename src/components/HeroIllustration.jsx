import React from "react";

// Original SVG illustration (not a stock image) echoing the logo's
// exchange motif: two figures trading skill icons via curved arrows.
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 420" width="100%" height="100%" role="img" aria-label="Two students exchanging skills, illustrated">
      <defs>
        <linearGradient id="figBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6cd9ff" />
          <stop offset="100%" stopColor="#1a5fc4" />
        </linearGradient>
        <linearGradient id="figPurple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b98bff" />
          <stop offset="100%" stopColor="#5b2fc9" />
        </linearGradient>
        <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6cd9ff" />
          <stop offset="100%" stopColor="#b98bff" />
        </linearGradient>
      </defs>

      <circle cx="210" cy="210" r="170" fill="rgba(255,255,255,0.03)" />
      <circle cx="210" cy="210" r="128" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      <path d="M120 130 A 110 110 0 0 1 300 150" fill="none" stroke="url(#arrowGrad)" strokeWidth="4" strokeLinecap="round" />
      <path d="M300 150 l -14 -10 M300 150 l -4 -17" stroke="#6cd9ff" strokeWidth="4" strokeLinecap="round" fill="none" />

      <path d="M300 290 A 110 110 0 0 1 122 268" fill="none" stroke="url(#arrowGrad)" strokeWidth="4" strokeLinecap="round" />
      <path d="M122 268 l 15 8 M122 268 l 2 17" stroke="#b98bff" strokeWidth="4" strokeLinecap="round" fill="none" />

      <g transform="translate(70,150)">
        <circle cx="40" cy="20" r="26" fill="url(#figBlue)" />
        <path d="M4 130 C 4 80 20 60 40 60 C 60 60 76 80 76 130 Z" fill="url(#figBlue)" />
      </g>

      <g transform="translate(270,220)">
        <circle cx="40" cy="20" r="26" fill="url(#figPurple)" />
        <path d="M4 130 C 4 80 20 60 40 60 C 60 60 76 80 76 130 Z" fill="url(#figPurple)" />
      </g>

      <g transform="translate(178,178)">
        <circle cx="32" cy="32" r="32" fill="#0b0a16" stroke="rgba(255,255,255,0.12)" />
        <path d="M28 16 L20 32 L28 32 L20 48" stroke="#6cd9ff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 16 L46 32 L38 32 L46 48" stroke="#b98bff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g transform="translate(40,60)">
        <rect width="44" height="44" rx="12" fill="rgba(108,217,255,0.14)" />
        <path d="M14 22 L20 16 M14 22 L20 28 M30 16 L24 22 L30 28" stroke="#6cd9ff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(0,0)" />
      </g>

      <g transform="translate(330,320)">
        <rect width="40" height="40" rx="11" fill="rgba(185,139,255,0.16)" />
        <circle cx="20" cy="20" r="9" fill="none" stroke="#b98bff" strokeWidth="2.4" />
      </g>

      <g transform="translate(330,60)">
        <rect width="36" height="36" rx="10" fill="rgba(108,217,255,0.12)" />
        <path d="M9 26 L14 12 L27 12 L22 26 Z" fill="none" stroke="#6cd9ff" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
