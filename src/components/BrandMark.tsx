/** The Dhuni Baba emblem: a sacred flame inside a ring of twelve signs. Decorative. */
export function BrandMark({ className }: { className?: string }) {
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="22" fill="none" stroke="#D6B36A" strokeWidth="1" />
      {ticks.map((deg) => (
        <line
          key={deg}
          x1="24" y1="3.5" x2="24" y2="6.5"
          stroke="#D6B36A" strokeWidth="1"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
      <path
        d="M24 12c-5 6-7 10-7 14a7 7 0 0 0 14 0c0-4-2-8-7-14Z"
        fill="none" stroke="#D6B36A" strokeWidth="1.2" strokeLinejoin="round"
      />
      <path d="M24 21c-2 3-3 5-3 6.5a3 3 0 0 0 6 0c0-1.5-1-3.5-3-6.5Z" fill="#D6B36A" />
      <path d="M15 36h18" stroke="#D6B36A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
