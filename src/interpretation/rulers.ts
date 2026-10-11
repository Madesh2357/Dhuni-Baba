import type { GrahaId } from '../astrology'

/** Classical sign rulers (Parashara), Mesha … Meena. */
export const SIGN_LORD: GrahaId[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
  'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
]

type Planet = Exclude<GrahaId, 'rahu' | 'ketu'>

/**
 * Natural friendships between planets (Brihat Parashara Hora Shastra).
 * Anything not listed as friend or enemy is neutral.
 */
export const NATURAL_RELATIONS: Record<Planet, { friends: Planet[]; enemies: Planet[] }> = {
  sun: { friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'] },
  moon: { friends: ['sun', 'mercury'], enemies: [] },
  mars: { friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'] },
  mercury: { friends: ['sun', 'venus'], enemies: ['moon'] },
  jupiter: { friends: ['sun', 'moon', 'mars'], enemies: ['mercury', 'venus'] },
  venus: { friends: ['mercury', 'saturn'], enemies: ['sun', 'moon'] },
  saturn: { friends: ['mercury', 'venus'], enemies: ['sun', 'moon', 'mars'] },
}

export type Relation = 'friend' | 'neutral' | 'enemy'

export function relation(of: Planet, towards: Planet): Relation {
  const r = NATURAL_RELATIONS[of]
  if (r.friends.includes(towards)) return 'friend'
  if (r.enemies.includes(towards)) return 'enemy'
  return 'neutral'
}

/** Venus is exalted in Meena, debilitated in Kanya, and owns Vrishabha and Tula. */
export function venusDignity(sign: number): 'exalted' | 'debilitated' | 'own' | null {
  if (sign === 11) return 'exalted'
  if (sign === 5) return 'debilitated'
  if (sign === 1 || sign === 6) return 'own'
  return null
}
