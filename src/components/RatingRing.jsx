import React from "react";

// Renders a rating (0-5) as a glowing circular ring, matching the
// reference aesthetic, instead of plain star text.
export default function RatingRing({ rating = 0, size = 50, glow = false }) {
  const pct = Math.min(rating / 5, 1);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const hasRating = rating > 0;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        filter: glow ? "drop-shadow(0 0 6px rgba(74,158,255,0.6))" : "none",
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="3"
        />
        {hasRating && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#ratingGradient)"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        )}
        <defs>
          <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6cd9ff" />
            <stop offset="100%" stopColor="#4a9eff" />
          </linearGradient>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.24,
          fontWeight: 700,
          color: hasRating ? "#6cd9ff" : "var(--text-muted)",
        }}
      >
        {hasRating ? rating.toFixed(1) : "—"}
      </div>
    </div>
  );
}
