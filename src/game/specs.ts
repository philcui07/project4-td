import type { Difficulty, EnemyKind, EnemySpec, MapSpec, TileKind, TowerKind, TowerSpec, WaveSpec } from "@/game/types"

export const GRID_W = 12
export const GRID_H = 5
export const LEVEL_COUNT = 8
export const WAVES_PER_LEVEL = 6

function makeTiles(): TileKind[][] {
  return Array.from({ length: GRID_H }, () => Array.from({ length: GRID_W }, () => "buildable" as const))
}

function makeMap(args: { path: { x: number; y: number }[]; blocked?: { x: number; y: number }[] }): MapSpec {
  const tiles = makeTiles()
  for (const p of args.path) tiles[p.y][p.x] = "road"
  for (const b of args.blocked ?? []) {
    if (tiles[b.y]?.[b.x] === "road") continue
    tiles[b.y][b.x] = "blocked"
  }
  return {
    tiles,
    path: args.path,
    spawn: args.path[0],
    base: args.path[args.path.length - 1],
  }
}

const MAPS: MapSpec[] = [
  makeMap({
    path: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 3 },
      { x: 8, y: 4 },
      { x: 9, y: 4 },
      { x: 10, y: 4 },
      { x: 11, y: 4 },
      { x: 11, y: 3 },
      { x: 11, y: 2 },
    ],
    blocked: [
      { x: 0, y: 0 },
      { x: 6, y: 4 },
      { x: 9, y: 0 },
    ],
  }),
  makeMap({
    path: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 8, y: 3 },
      { x: 8, y: 2 },
      { x: 9, y: 2 },
      { x: 9, y: 3 },
      { x: 9, y: 4 },
      { x: 10, y: 4 },
      { x: 11, y: 4 },
      { x: 11, y: 3 },
      { x: 11, y: 2 },
    ],
    blocked: [
      { x: 0, y: 4 },
      { x: 9, y: 4 },
    ],
  }),
  makeMap({
    path: [
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 5, y: 2 },
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 7, y: 1 },
      { x: 8, y: 1 },
      { x: 8, y: 2 },
      { x: 9, y: 2 },
      { x: 10, y: 2 },
      { x: 11, y: 2 },
      { x: 11, y: 1 },
      { x: 11, y: 0 },
    ],
    blocked: [
      { x: 4, y: 4 },
      { x: 9, y: 4 },
    ],
  }),
  makeMap({
    path: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 7, y: 2 },
      { x: 8, y: 2 },
      { x: 9, y: 2 },
      { x: 10, y: 2 },
      { x: 11, y: 2 },
      { x: 11, y: 1 },
    ],
    blocked: [
      { x: 0, y: 4 },
      { x: 4, y: 0 },
      { x: 9, y: 0 },
    ],
  }),
  makeMap({
    path: [
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 8, y: 4 },
      { x: 9, y: 4 },
      { x: 10, y: 4 },
      { x: 11, y: 4 },
      { x: 11, y: 3 },
      { x: 11, y: 2 },
    ],
    blocked: [
      { x: 9, y: 0 },
      { x: 0, y: 0 },
    ],
  }),
  makeMap({
    path: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 7, y: 3 },
      { x: 8, y: 3 },
      { x: 9, y: 3 },
      { x: 10, y: 3 },
      { x: 11, y: 3 },
      { x: 11, y: 4 },
    ],
    blocked: [
      { x: 9, y: 0 },
      { x: 0, y: 4 },
    ],
  }),
  makeMap({
    path: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 2 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 8, y: 3 },
      { x: 8, y: 2 },
      { x: 9, y: 2 },
      { x: 10, y: 2 },
      { x: 11, y: 2 },
      { x: 11, y: 3 },
      { x: 11, y: 4 },
    ],
    blocked: [
      { x: 9, y: 4 },
      { x: 5, y: 4 },
    ],
  }),
  makeMap({
    path: [
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 8, y: 4 },
      { x: 9, y: 4 },
      { x: 10, y: 4 },
      { x: 11, y: 4 },
      { x: 11, y: 3 },
      { x: 10, y: 3 },
      { x: 10, y: 2 },
      { x: 11, y: 2 },
    ],
    blocked: [
      { x: 0, y: 0 },
      { x: 9, y: 0 },
    ],
  }),
]

const towers: Record<TowerKind, TowerSpec> = {
  mg: {
    kind: "mg",
    name: "机枪塔",
    cost: 25,
    rangeTiles: 2.2,
    fireRate: 6.5,
    damage: 7,
    armorMultiplier: { light: 1.25, medium: 1, heavy: 0.6 },
    upgradeCosts: [22, 34],
    upgradeMultiplier: [1.25, 1.55],
    projectileSpeed: 920,
  },
  at: {
    kind: "at",
    name: "反坦克炮",
    cost: 40,
    rangeTiles: 2.8,
    fireRate: 1.35,
    damage: 55,
    armorMultiplier: { light: 0.9, medium: 1.05, heavy: 1.55 },
    upgradeCosts: [38, 55],
    upgradeMultiplier: [1.3, 1.65],
    projectileSpeed: 420,
  },
  mortar: {
    kind: "mortar",
    name: "迫击炮",
    cost: 45,
    rangeTiles: 3.3,
    minRangeTiles: 1.2,
    fireRate: 0.75,
    damage: 42,
    armorMultiplier: { light: 1.1, medium: 1, heavy: 0.95 },
    upgradeCosts: [40, 62],
    upgradeMultiplier: [1.25, 1.55],
    projectileSpeed: 0,
    splashRadiusTiles: 1.05,
  },
}

const enemiesBase: Record<EnemyKind, EnemySpec> = {
  infantry: { kind: "infantry", name: "步兵", maxHp: 48, speedTilesPerSec: 1.2, armor: "light", reward: 6 },
  car: { kind: "car", name: "装甲车", maxHp: 140, speedTilesPerSec: 1.55, armor: "medium", reward: 14 },
  tank: { kind: "tank", name: "坦克", maxHp: 360, speedTilesPerSec: 0.75, armor: "heavy", reward: 28 },
  boss: { kind: "boss", name: "重型Boss", maxHp: 2088, speedTilesPerSec: 0.45, armor: "heavy", reward: 120 },
}

export function getTowerSpec(kind: TowerKind) {
  return towers[kind]
}

export function getTowerStats(kind: TowerKind, level: number) {
  const spec = getTowerSpec(kind)
  const dmgMul =
    level <= 0
      ? 1
      : spec.upgradeMultiplier[level - 1] ?? spec.upgradeMultiplier[spec.upgradeMultiplier.length - 1] ?? 1

  const range = spec.rangeTiles + level * 0.15
  const fireMul = kind === "mg" ? 1 + level * 0.1 : kind === "at" ? 1 + level * 0.06 : 1 + level * 0.08
  const fireRate = spec.fireRate * fireMul
  const damage = spec.damage * dmgMul

  return {
    kind,
    level,
    rangeTiles: range,
    fireRate,
    damage,
    projectileSpeed: spec.projectileSpeed,
    armorMultiplier: spec.armorMultiplier,
    minRangeTiles: spec.minRangeTiles,
    splashRadiusTiles: spec.splashRadiusTiles,
  }
}

export function getMap(levelIndex: number): MapSpec {
  const idx = Math.max(0, Math.min(LEVEL_COUNT - 1, Math.floor(levelIndex)))
  return MAPS[idx]
}

export function getEnemySpec(kind: EnemyKind, difficulty: Difficulty, levelIndex: number, waveIndex: number): EnemySpec {
  const base = enemiesBase[kind]
  const kindSpeedMul = kind === "car" ? 0.9 : 1
  // 全局调整（按需求）：移速 +20%；防御（这里按血量 maxHp 体现）整体提升；
  // Boss 单独按“变为 2 倍”处理（不与 1.5 叠乘）。
  const globalHpMul = kind === "boss" ? 2 : 1.5
  const globalSpeedMul = 1.2

  // 难度系数
  const hpMul = difficulty === "easy" ? 0.9 : difficulty === "veteran" ? 1.05 : 1
  const speedMul = difficulty === "easy" ? 0.95 : difficulty === "veteran" ? 0.98 : 1
  const rewardMul = difficulty === "easy" ? 0.95 : difficulty === "veteran" ? 1.05 : 1
  const levelMul = 1 + Math.max(0, Math.min(LEVEL_COUNT - 1, levelIndex)) * 0.12
  const waveMul = 1 + Math.max(0, Math.min(WAVES_PER_LEVEL - 1, waveIndex)) * 0.05
  return {
    ...base,
    maxHp: Math.round(base.maxHp * globalHpMul * hpMul * levelMul * waveMul),
    speedTilesPerSec: base.speedTilesPerSec * kindSpeedMul * globalSpeedMul * speedMul,
    reward: Math.round(base.reward * rewardMul * (0.92 + levelMul * 0.1 + waveMul * 0.08)),
  }
}

export function getStartSupply(difficulty: Difficulty) {
  void difficulty
  // 每关开局固定 100，不随难度变化，也不继承上一关。
  return 100
}

export function getStartBaseHp(difficulty: Difficulty) {
  return difficulty === "easy" ? 20 : difficulty === "veteran" ? 10 : 14
}

export function getWaves(difficulty: Difficulty, levelIndex: number): WaveSpec[] {
  const density = difficulty === "easy" ? 0.9 : difficulty === "veteran" ? 1 : 1
  const countMul = difficulty === "veteran" ? 1.15 : 1
  const clamp = (n: number) => Math.max(0.32, n)
  const levelStage = 1 + Math.max(0, Math.min(LEVEL_COUNT - 1, levelIndex)) * 0.16

  const base: WaveSpec[] = [
    { entries: [{ kind: "infantry", count: 8, interval: 0.6 }] },
    { entries: [{ kind: "infantry", count: 10, interval: 0.56 }] },
    { entries: [{ kind: "infantry", count: 9, interval: 0.52 }, { kind: "car", count: 2, interval: 1.2 }] },
    { entries: [{ kind: "car", count: 5, interval: 1.05 }, { kind: "infantry", count: 7, interval: 0.5 }] },
    { entries: [{ kind: "tank", count: 1, interval: 1.9 }, { kind: "car", count: 5, interval: 1.0 }] },
    { entries: [{ kind: "boss", count: 1, interval: 2.6 }, { kind: "tank", count: 1, interval: 1.75 }, { kind: "car", count: 8, interval: 0.9 }] },
  ]

  return base.map((w, idx) => {
    const waveStage = 1 + idx * 0.12
    return {
      entries: w.entries.map((e) => ({
        ...e,
        count: e.kind === "boss" ? 1 : Math.round(e.count * density * levelStage * waveStage * countMul),
        interval: clamp(e.interval / (density * (0.95 + levelIndex * 0.03 + idx * 0.06))),
      })),
    }
  })
}

export function isRoad(tile: TileKind) {
  return tile === "road"
}
