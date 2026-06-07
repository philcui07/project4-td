export type Difficulty = "easy" | "normal" | "veteran"

export type TileKind = "road" | "buildable" | "blocked"

export type ArmorKind = "light" | "medium" | "heavy"

export type TowerKind = "mg" | "at" | "mortar"

export type EnemyKind = "infantry" | "car" | "tank" | "boss"

export type GamePhase = "menu" | "playing" | "level_clear" | "report"

export type WaveState = "build" | "combat" | "paused"

export type Vec2 = { x: number; y: number }

export type TilePos = { x: number; y: number }

export interface TowerSpec {
  kind: TowerKind
  name: string
  cost: number
  rangeTiles: number
  fireRate: number
  damage: number
  armorMultiplier: Record<ArmorKind, number>
  upgradeCosts: number[]
  upgradeMultiplier: number[]
  projectileSpeed: number
  splashRadiusTiles?: number
  minRangeTiles?: number
}

export interface EnemySpec {
  kind: EnemyKind
  name: string
  maxHp: number
  speedTilesPerSec: number
  armor: ArmorKind
  reward: number
}

export interface WaveEntry {
  kind: EnemyKind
  count: number
  interval: number
}

export interface WaveSpec {
  entries: WaveEntry[]
}

export interface MapSpec {
  tiles: TileKind[][]
  path: TilePos[]
  base: TilePos
  spawn: TilePos
}

export interface Tower {
  id: string
  kind: TowerKind
  tile: TilePos
  level: number
  cooldown: number
}

export interface Enemy {
  id: string
  kind: EnemyKind
  hp: number
  pathIndex: number
  pos: Vec2
}

export interface Projectile {
  id: string
  kind: TowerKind
  pos: Vec2
  vel: Vec2
  targetId?: string
  ttl: number
  ttlMax?: number
  origin?: Vec2
  impactPos?: Vec2
  impactRadius?: number
  impactDamage?: number
  impactArmorMultiplier?: Record<ArmorKind, number>
}

export interface Blast {
  id: string
  pos: Vec2
  radius: number
  ttl: number
}

export interface GameRuntime {
  map: MapSpec
  towers: Tower[]
  enemies: Enemy[]
  projectiles: Projectile[]
  blasts: Blast[]
  waveSpawnPlan: { kind: EnemyKind; at: number }[]
  waveClock: number
  waveSpawnCursor: number
}
