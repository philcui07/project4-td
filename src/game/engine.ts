import { uid } from "@/game/id"
import { getEnemySpec, getTowerSpec, getTowerStats, getWaves } from "@/game/specs"
import type { Difficulty, Enemy, EnemyKind, GameRuntime, MapSpec, Projectile, TilePos, Tower, TowerKind, Vec2, WaveSpec } from "@/game/types"

export function tileCenter(tile: TilePos, tileSize: number): Vec2 {
  return { x: (tile.x + 0.5) * tileSize, y: (tile.y + 0.5) * tileSize }
}

function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

function mul(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s }
}

function len(v: Vec2) {
  return Math.hypot(v.x, v.y)
}

function norm(v: Vec2): Vec2 {
  const l = len(v)
  if (l <= 1e-6) return { x: 0, y: 0 }
  return { x: v.x / l, y: v.y / l }
}

export function createRuntime(map: MapSpec): GameRuntime {
  return {
    map,
    towers: [],
    enemies: [],
    projectiles: [],
    blasts: [],
    waveSpawnPlan: [],
    waveClock: 0,
    waveSpawnCursor: 0,
  }
}

export function buildWavePlan(wave: WaveSpec): { kind: EnemyKind; at: number }[] {
  const plan: { kind: EnemyKind; at: number }[] = []
  let t = 0
  for (const entry of wave.entries) {
    for (let i = 0; i < entry.count; i += 1) {
      plan.push({ kind: entry.kind, at: t })
      t += entry.interval
    }
  }
  return plan
}

export function startWave(runtime: GameRuntime, waveSpec: WaveSpec) {
  runtime.waveSpawnPlan = buildWavePlan(waveSpec)
  runtime.waveClock = 0
  runtime.waveSpawnCursor = 0
}

export function placeTower(runtime: GameRuntime, kind: TowerKind, tile: TilePos): Tower {
  const tower: Tower = { id: uid("t"), kind, tile, level: 0, cooldown: 0 }
  runtime.towers = [...runtime.towers, tower]
  return tower
}

export function upgradeTower(runtime: GameRuntime, towerId: string) {
  const idx = runtime.towers.findIndex((t) => t.id === towerId)
  if (idx < 0) return null
  const tower = runtime.towers[idx]
  const spec = getTowerSpec(tower.kind)
  if (tower.level >= spec.upgradeCosts.length) return null
  const next = { ...tower, level: tower.level + 1 }
  runtime.towers = [...runtime.towers.slice(0, idx), next, ...runtime.towers.slice(idx + 1)]
  return { tower: next, cost: spec.upgradeCosts[tower.level] }
}

export function sellTower(runtime: GameRuntime, towerId: string) {
  const tower = runtime.towers.find((t) => t.id === towerId)
  if (!tower) return null
  const spec = getTowerSpec(tower.kind)
  const upgradesSpent = spec.upgradeCosts.slice(0, tower.level).reduce((a, b) => a + b, 0)
  const refund = Math.round((spec.cost + upgradesSpent) * 0.55)
  runtime.towers = runtime.towers.filter((t) => t.id !== towerId)
  return refund
}

export function stepRuntime(args: {
  runtime: GameRuntime
  difficulty: Difficulty
  levelIndex: number
  waveIndex: number
  dt: number
  tileSize: number
  onEnemyKilled: (args: { count: number; reward: number }) => void
  onEnemyLeaked: () => void
}) {
  const { runtime, difficulty, levelIndex, waveIndex, dt, tileSize, onEnemyKilled, onEnemyLeaked } = args

  runtime.waveClock += dt
  while (
    runtime.waveSpawnCursor < runtime.waveSpawnPlan.length &&
    runtime.waveSpawnPlan[runtime.waveSpawnCursor].at <= runtime.waveClock
  ) {
    const { kind } = runtime.waveSpawnPlan[runtime.waveSpawnCursor]
    runtime.waveSpawnCursor += 1
    runtime.enemies = [...runtime.enemies, spawnEnemy(kind, difficulty, levelIndex, waveIndex, tileSize, runtime.map.spawn)]
  }

  runtime.enemies = runtime.enemies
    .map((e) => moveEnemy(e, difficulty, levelIndex, waveIndex, tileSize, runtime.map.path, dt))
    .filter((e) => {
      const reachedBase = e.pathIndex >= runtime.map.path.length - 1 && len(sub(e.pos, tileCenter(runtime.map.base, tileSize))) < 6
      if (!reachedBase) return true
      onEnemyLeaked()
      return false
    })

  runtime.towers = runtime.towers.map((t) => tickTower(t, dt))

  for (const tower of runtime.towers) {
    if (tower.cooldown > 0) continue
    const proj = tryFireTower({ runtime, tower, tileSize })
    if (!proj) continue
    runtime.projectiles = [...runtime.projectiles, proj]
  }

  const nextProjectiles: Projectile[] = []
  for (const p of runtime.projectiles) {
    const updated = tickProjectile({ runtime, projectile: p, difficulty, levelIndex, waveIndex, dt })
    if (updated.keep) nextProjectiles.push(updated.projectile)
  }
  runtime.projectiles = nextProjectiles

  runtime.blasts = runtime.blasts
    .map((b) => ({ ...b, ttl: b.ttl - dt }))
    .filter((b) => b.ttl > 0)

  const { killedIds, rewardSum } = collectDeadEnemies({ runtime, difficulty, levelIndex, waveIndex })
  if (killedIds.length > 0) {
    runtime.enemies = runtime.enemies.filter((e) => !killedIds.includes(e.id))
    onEnemyKilled({ count: killedIds.length, reward: rewardSum })
  }
}

export function isWaveDone(runtime: GameRuntime) {
  const allSpawned = runtime.waveSpawnCursor >= runtime.waveSpawnPlan.length
  return allSpawned && runtime.enemies.length === 0 && runtime.projectiles.length === 0
}

export function getTotalWaves(difficulty: Difficulty, levelIndex: number) {
  return getWaves(difficulty, levelIndex).length
}

export function getWaveSpec(difficulty: Difficulty, levelIndex: number, waveIndex: number) {
  return getWaves(difficulty, levelIndex)[waveIndex]
}

function spawnEnemy(kind: EnemyKind, difficulty: Difficulty, levelIndex: number, waveIndex: number, tileSize: number, spawnTile: TilePos): Enemy {
  const spec = getEnemySpec(kind, difficulty, levelIndex, waveIndex)
  return {
    id: uid("e"),
    kind,
    hp: spec.maxHp,
    pathIndex: 0,
    pos: tileCenter(spawnTile, tileSize),
  }
}

function moveEnemy(enemy: Enemy, difficulty: Difficulty, levelIndex: number, waveIndex: number, tileSize: number, path: TilePos[], dt: number): Enemy {
  const spec = getEnemySpec(enemy.kind, difficulty, levelIndex, waveIndex)
  let remaining = spec.speedTilesPerSec * tileSize * dt
  let nextEnemy = { ...enemy }
  while (remaining > 0) {
    const nextIndex = Math.min(nextEnemy.pathIndex + 1, path.length - 1)
    const target = tileCenter(path[nextIndex], tileSize)
    const to = sub(target, nextEnemy.pos)
    const d = len(to)
    if (d <= 1e-6) {
      nextEnemy = { ...nextEnemy, pathIndex: nextIndex, pos: target }
      if (nextIndex >= path.length - 1) break
      continue
    }
    if (remaining >= d) {
      remaining -= d
      nextEnemy = { ...nextEnemy, pathIndex: nextIndex, pos: target }
      if (nextIndex >= path.length - 1) break
      continue
    }
    const dir = mul(to, 1 / d)
    nextEnemy = { ...nextEnemy, pos: add(nextEnemy.pos, mul(dir, remaining)) }
    remaining = 0
  }
  return nextEnemy
}

function tickTower(tower: Tower, dt: number): Tower {
  return { ...tower, cooldown: Math.max(0, tower.cooldown - dt) }
}

function tryFireTower(args: { runtime: GameRuntime; tower: Tower; tileSize: number }) {
  const { runtime, tower, tileSize } = args
  const spec = getTowerSpec(tower.kind)
  const stats = getTowerStats(tower.kind, tower.level)
  const towerPos = tileCenter(tower.tile, tileSize)
  const rangePx = stats.rangeTiles * tileSize
  const minRangePx = (stats.minRangeTiles ?? 0) * tileSize

  const candidates = runtime.enemies
    .map((e) => {
      const d = len(sub(e.pos, towerPos))
      return { e, d }
    })
    .filter((x) => x.d <= rangePx && x.d >= minRangePx)
    .sort((a, b) => {
      if (a.e.pathIndex !== b.e.pathIndex) return b.e.pathIndex - a.e.pathIndex
      return a.d - b.d
    })

  const target = candidates[0]?.e
  if (!target) return null

  const nextCooldown = 1 / stats.fireRate
  tower.cooldown = nextCooldown

  if (tower.kind === "mortar") {
    const dmg = stats.damage
    return {
      id: uid("p"),
      kind: tower.kind,
      pos: { ...target.pos },
      vel: { x: 0, y: 0 },
      ttl: 0.66,
      impactRadius: (stats.splashRadiusTiles ?? 1) * tileSize,
      impactDamage: dmg,
      impactArmorMultiplier: spec.armorMultiplier,
    } satisfies Projectile
  }

  const to = sub(target.pos, towerPos)
  const v = mul(norm(to), stats.projectileSpeed)
  return {
    id: uid("p"),
    kind: tower.kind,
    pos: towerPos,
    vel: v,
    targetId: target.id,
    ttl: 2.2,
    impactDamage: stats.damage,
    impactArmorMultiplier: spec.armorMultiplier,
  } satisfies Projectile
}

function tickProjectile(args: { runtime: GameRuntime; projectile: Projectile; difficulty: Difficulty; levelIndex: number; waveIndex: number; dt: number }) {
  const { runtime, projectile, difficulty, levelIndex, waveIndex, dt } = args
  const p = { ...projectile, ttl: projectile.ttl - dt, pos: add(projectile.pos, mul(projectile.vel, dt)) }
  if (p.ttl <= 0) {
    if (p.kind === "mortar") {
      return resolveMortar({ runtime, projectile: p, difficulty, levelIndex, waveIndex })
    }
    return { keep: false as const, projectile: p }
  }
  if (!p.targetId) return { keep: true as const, projectile: p }
  const target = runtime.enemies.find((e) => e.id === p.targetId)
  if (!target) return { keep: false as const, projectile: p }
  const d = len(sub(target.pos, p.pos))
  if (d > 14) return { keep: true as const, projectile: p }
  const armor = getEnemySpec(target.kind, difficulty, levelIndex, waveIndex).armor
  const mult = p.impactArmorMultiplier ? p.impactArmorMultiplier[armor] : 1
  const dmg = (p.impactDamage ?? 0) * mult
  runtime.enemies = runtime.enemies.map((e) => (e.id === target.id ? { ...e, hp: e.hp - dmg } : e))
  return { keep: false as const, projectile: p }
}

function resolveMortar(args: { runtime: GameRuntime; projectile: Projectile; difficulty: Difficulty; levelIndex: number; waveIndex: number }) {
  const { runtime, projectile, difficulty, levelIndex, waveIndex } = args
  const radius = projectile.impactRadius ?? 0
  const damage = projectile.impactDamage ?? 0
  const mult = projectile.impactArmorMultiplier
  runtime.blasts = [...runtime.blasts, { id: uid("b"), pos: projectile.pos, radius, ttl: 0.26 }]
  runtime.enemies = runtime.enemies.map((e) => {
    const armor = getEnemySpec(e.kind, difficulty, levelIndex, waveIndex).armor
    const m = mult ? mult[armor] : 1
    const d = len(sub(e.pos, projectile.pos))
    if (d > radius) return e
    const falloff = 0.65 + 0.35 * (1 - d / Math.max(1, radius))
    return { ...e, hp: e.hp - damage * m * falloff }
  })
  return { keep: false as const, projectile }
}

function collectDeadEnemies(args: { runtime: GameRuntime; difficulty: Difficulty; levelIndex: number; waveIndex: number }) {
  const { runtime, difficulty, levelIndex, waveIndex } = args
  const killedIds: string[] = []
  let rewardSum = 0
  for (const e of runtime.enemies) {
    if (e.hp > 0) continue
    killedIds.push(e.id)
    rewardSum += getEnemySpec(e.kind, difficulty, levelIndex, waveIndex).reward
  }
  return { killedIds, rewardSum }
}
