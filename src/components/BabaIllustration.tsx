import styles from './Illustration.module.css'

/**
 * Original line-art of Dhuni Baba: seated cross-legged before his dhuni
 * (sacred fire), one finger raised mid-prophecy. Drawn by hand in SVG so it
 * stays crisp at any size and weighs almost nothing.
 */
export function BabaIllustration({ label, className }: { label: string; className?: string }) {
  const ticks = Array.from({ length: 27 }, (_, i) => (i * 360) / 27)
  return (
    <svg viewBox="40 10 240 360" className={`${styles.art} ${className ?? ''}`} role="img" aria-label={label}>
      {/* Halo marked with the 27 nakshatras */}
      <g className={styles.faint}>
        <circle cx="160" cy="110" r="80" />
        {ticks.map((deg) => (
          <line key={deg} x1="160" y1="26" x2="160" y2="32" transform={`rotate(${deg} 160 110)`} />
        ))}
      </g>

      <g className={styles.line}>
        {/* Torso and shoulders */}
        <path d="M120 162C112 200 114 240 122 268M200 162C208 200 206 240 198 268" />
        <path d="M120 162C128 150 142 145 150 142M200 162C192 150 178 145 170 142" />

        {/* Raised arm, finger pointing skyward */}
        <path d="M120 164C104 174 94 188 90 202C84 182 80 162 82 146" />
        <path d="M104 196C99 182 95 168 95 152" />
        <path d="M80 148C77 138 83 131 91 132C98 134 99 142 95 150" />
        <path d="M84 134C82 124 80 116 78 106Q80 102 83 105C85 114 87 122 89 132" />

        {/* Resting arm and hand on knee */}
        <path d="M200 164C214 182 222 212 226 248M190 192C198 212 203 232 205 250" />
        <path d="M205 250Q217 258 231 248" />

        {/* Waist cloth and crossed legs */}
        <path className={styles.cloth} d="M122 266C140 276 180 276 198 266L200 280C180 290 140 290 120 280Z" />
        <path d="M70 296C90 266 230 266 250 296C236 312 84 312 70 296Z" />
        <path d="M98 288C132 278 182 282 216 298M108 302C142 290 192 286 232 286" />
        <path d="M232 286Q246 284 248 294M84 296Q76 290 82 283" />
      </g>

      {/* Head drawn after the body so the beard sits in front */}
      <g className={styles.line}>
        <path className={styles.mask} d="M134 116C132 150 140 190 154 222C157 230 155 236 160 244C163 236 168 230 168 220C180 190 188 150 186 116Z" />
        <path d="M150 170C152 190 156 206 160 220M170 170C168 188 166 200 164 212" className={styles.faintLine} />
        <ellipse className={styles.mask} cx="160" cy="104" rx="29" ry="33" />
        <path d="M131 104Q125 108 130 116M189 104Q195 108 190 116" />
        <path className={styles.gold} d="M147 82Q160 78 173 82M146 87Q160 83 174 87M147 92Q160 88 173 92" />
        <path d="M141 99Q148 94 155 98M165 98Q172 94 179 99" />
        <path d="M143 106Q149 110 155 106M165 106Q171 110 177 106" />
        <path d="M160 104Q156 114 160 117" />
        <path d="M144 124Q152 117 160 121Q168 117 176 124" />
        <circle cx="160" cy="127" r="2.6" />
      </g>

      {/* The dhuni: a small fire in a clay bowl */}
      <g>
        <path className={styles.flame} d="M160 344C146 332 149 318 160 300C171 318 174 332 160 344Z" />
        <path className={styles.flameCore} d="M160 342C154 336 155 328 160 320C165 328 166 336 160 342Z" />
        <path className={styles.line} d="M122 344H198M130 344C138 358 182 358 190 344" />
        <circle className={styles.ember} cx="148" cy="296" r="1.4" />
        <circle className={styles.ember} cx="174" cy="290" r="1.1" />
      </g>
    </svg>
  )
}
