/**
 * Ashtakoota Guna Milan — the traditional 36-point compatibility match,
 * computed from each person's Moon sign (rashi) and nakshatra.
 *
 * The classical tables are written for a groom (`groom`) and a bride
 * (`bride`); Varna and Gana are the only kootas here whose score depends on
 * which person takes which role.
 *
 * Conventions (documented on the Method page):
 *   - Varna, Tara, Graha Maitri, Bhakoot, Nadi: standard rules.
 *   - Vashya: five-group table (quadruped / human / water / wild / insect),
 *     with Dhanu and Makara split at 15°.
 *   - Gana: common North Indian table.
 *   - Yoni: SIMPLIFIED — same animal 4, sworn enemies 0, every other pair 2.
 *     Full 14 × 14 Yoni tables differ between almanacs, and we would rather
 *     simplify openly than copy a table we cannot verify.
 */
import { relation } from './rulers'
import { SIGN_LORD } from './rulers'

export interface MoonPlacement {
  /** Sidereal longitude of the Moon, used for Vashya's half-sign split. */
  longitude: number
  sign: number
  nakshatra: number
}

export type KootaId = 'varna' | 'vashya' | 'tara' | 'yoni' | 'maitri' | 'gana' | 'bhakoot' | 'nadi'

export interface KootaScore {
  id: KootaId
  score: number
  max: number
}

export interface GunaMilan {
  kootas: KootaScore[]
  total: number
  nadiDosha: boolean
  bhakootDosha: boolean
}

// —— Varna (max 1) ——  0 Brahmin > 1 Kshatriya > 2 Vaishya > 3 Shudra
const VARNA_BY_SIGN = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]
export function varnaScore(groom: MoonPlacement, bride: MoonPlacement) {
  // 1 point when the groom's varna is equal to or higher than the bride's.
  return VARNA_BY_SIGN[groom.sign] <= VARNA_BY_SIGN[bride.sign] ? 1 : 0
}

// —— Vashya (max 2) ——
type VashyaGroup = 'quadruped' | 'human' | 'water' | 'wild' | 'insect'
export function vashyaGroup(p: MoonPlacement): VashyaGroup {
  const firstHalf = p.longitude % 30 < 15
  switch (p.sign) {
    case 0: case 1: return 'quadruped'
    case 2: case 5: case 6: case 10: return 'human'
    case 3: case 11: return 'water'
    case 4: return 'wild'
    case 7: return 'insect'
    case 8: return firstHalf ? 'human' : 'quadruped' // Dhanu
    default: return firstHalf ? 'quadruped' : 'water' // Makara
  }
}
const VASHYA_TABLE: Record<VashyaGroup, Record<VashyaGroup, number>> = {
  quadruped: { quadruped: 2, human: 1, water: 1, wild: 0.5, insect: 1 },
  human: { quadruped: 1, human: 2, water: 0.5, wild: 0, insect: 1 },
  water: { quadruped: 1, human: 0.5, water: 2, wild: 1, insect: 1 },
  wild: { quadruped: 0.5, human: 0, water: 1, wild: 2, insect: 0 },
  insect: { quadruped: 1, human: 1, water: 1, wild: 0, insect: 2 },
}
export function vashyaScore(groom: MoonPlacement, bride: MoonPlacement) {
  return VASHYA_TABLE[vashyaGroup(groom)][vashyaGroup(bride)]
}

// —— Tara (max 3) ——  count stars from one to the other; remainders 3, 5, 7 (of 9) are inauspicious.
function taraGood(from: number, to: number) {
  const count = ((to - from + 27) % 27) + 1
  return ![3, 5, 7].includes(count % 9)
}
export function taraScore(groom: MoonPlacement, bride: MoonPlacement) {
  const good = Number(taraGood(bride.nakshatra, groom.nakshatra)) + Number(taraGood(groom.nakshatra, bride.nakshatra))
  return good * 1.5
}

// —— Yoni (max 4, simplified) ——
export const YONI = [
  'horse', 'elephant', 'sheep', 'serpent', 'serpent', 'dog', 'cat', 'sheep', 'cat',
  'rat', 'rat', 'cow', 'buffalo', 'tiger', 'buffalo', 'tiger', 'deer', 'deer',
  'dog', 'monkey', 'mongoose', 'monkey', 'lion', 'horse', 'lion', 'cow', 'elephant',
] as const
const SWORN_ENEMIES: [string, string][] = [
  ['horse', 'buffalo'], ['elephant', 'lion'], ['sheep', 'monkey'], ['serpent', 'mongoose'],
  ['dog', 'deer'], ['cat', 'rat'], ['cow', 'tiger'],
]
export function yoniScore(a: MoonPlacement, b: MoonPlacement) {
  const ya = YONI[a.nakshatra]
  const yb = YONI[b.nakshatra]
  if (ya === yb) return 4
  if (SWORN_ENEMIES.some(([x, y]) => (x === ya && y === yb) || (x === yb && y === ya))) return 0
  return 2
}

// —— Graha Maitri (max 5) ——  friendship between the Moon-sign lords.
export function maitriScore(a: MoonPlacement, b: MoonPlacement) {
  const la = SIGN_LORD[a.sign] as Parameters<typeof relation>[0]
  const lb = SIGN_LORD[b.sign] as Parameters<typeof relation>[0]
  if (la === lb) return 5
  const pair = [relation(la, lb), relation(lb, la)].sort().join('+')
  const table: Record<string, number> = {
    'friend+friend': 5,
    'friend+neutral': 4,
    'neutral+neutral': 3,
    'enemy+friend': 1,
    'enemy+neutral': 0.5,
    'enemy+enemy': 0,
  }
  return table[pair]
}

// —— Gana (max 6) ——  0 Deva, 1 Manushya, 2 Rakshasa
export const GANA = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0]
const GANA_TABLE = [
  // bride: Deva, Manushya, Rakshasa   (rows: groom)
  [6, 6, 0],
  [5, 6, 0],
  [1, 0, 6],
]
export function ganaScore(groom: MoonPlacement, bride: MoonPlacement) {
  return GANA_TABLE[GANA[groom.nakshatra]][GANA[bride.nakshatra]]
}

// —— Bhakoot (max 7) ——  2/12, 5/9 and 6/8 sign relationships score 0.
export function bhakootScore(a: MoonPlacement, b: MoonPlacement) {
  const d = ((b.sign - a.sign + 12) % 12) + 1
  return [2, 12, 5, 9, 6, 8].includes(d) ? 0 : 7
}

// —— Nadi (max 8) ——  0 Adi, 1 Madhya, 2 Antya; zig-zag through the 27 stars.
export const NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2]
export function nadiScore(a: MoonPlacement, b: MoonPlacement) {
  return NADI[a.nakshatra] === NADI[b.nakshatra] ? 0 : 8
}

export function gunaMilan(groom: MoonPlacement, bride: MoonPlacement): GunaMilan {
  const kootas: KootaScore[] = [
    { id: 'varna', score: varnaScore(groom, bride), max: 1 },
    { id: 'vashya', score: vashyaScore(groom, bride), max: 2 },
    { id: 'tara', score: taraScore(groom, bride), max: 3 },
    { id: 'yoni', score: yoniScore(groom, bride), max: 4 },
    { id: 'maitri', score: maitriScore(groom, bride), max: 5 },
    { id: 'gana', score: ganaScore(groom, bride), max: 6 },
    { id: 'bhakoot', score: bhakootScore(groom, bride), max: 7 },
    { id: 'nadi', score: nadiScore(groom, bride), max: 8 },
  ]
  return {
    kootas,
    total: kootas.reduce((sum, k) => sum + k.score, 0),
    nadiDosha: kootas[7].score === 0,
    bhakootDosha: kootas[6].score === 0,
  }
}

export type MatchBand = 'low' | 'ok' | 'good' | 'great'
export function matchBand(total: number): MatchBand {
  if (total < 18) return 'low'
  if (total <= 24) return 'ok'
  if (total <= 32) return 'good'
  return 'great'
}
