import { describe, expect, it } from "vitest"
import { buildWavePlan, createRuntime, getWaveSpec, placeTower, startWave, stepRuntime } from "@/game/engine"
import { getMap, GRID_H, GRID_W, LEVEL_COUNT, WAVES_PER_LEVEL } from "@/game/specs"

describe("engine", () => {
  it("buildWavePlan expands entries into a timed plan", () => {
    const plan = buildWavePlan({ entries: [{ kind: "infantry", count: 3, interval: 0.5 }] })
    expect(plan).toHaveLength(3)
    expect(plan[0].at).toBe(0)
    expect(plan[1].at).toBeCloseTo(0.5)
    expect(plan[2].at).toBeCloseTo(1.0)
  })

  it("spawns enemies and allows a tower to kill", () => {
    const runtime = createRuntime(getMap(0))
    const tileSize = 80
    const difficulty = "normal" as const

    startWave(runtime, { entries: [{ kind: "infantry", count: 1, interval: 0.1 }] })
    placeTower(runtime, "mg", { x: 1, y: 2 })

    let reward = 0
    let leaks = 0

    for (let i = 0; i < 500; i += 1) {
      stepRuntime({
        runtime,
        difficulty,
        levelIndex: 0,
        waveIndex: 0,
        dt: 1 / 60,
        tileSize,
        onEnemyKilled: (k) => {
          reward += k.reward
        },
        onEnemyLeaked: () => {
          leaks += 1
        },
      })
      if (reward > 0 || leaks > 0) break
    }

    expect(leaks).toBe(0)
    expect(reward).toBeGreaterThan(0)
  })

  it("wave specs exist for all waves", () => {
    const difficulty = "normal" as const
    for (let i = 0; i < WAVES_PER_LEVEL; i += 1) {
      const w = getWaveSpec(difficulty, 0, i)
      expect(w.entries.length).toBeGreaterThan(0)
    }
    expect(GRID_W).toBe(12)
    expect(GRID_H).toBe(5)
  })

  it("maps have continuous paths and no extra road tiles", () => {
    for (let levelIndex = 0; levelIndex < LEVEL_COUNT; levelIndex += 1) {
      const map = getMap(levelIndex)
      expect(map.path.length).toBeGreaterThan(1)

      for (let i = 1; i < map.path.length; i += 1) {
        const a = map.path[i - 1]
        const b = map.path[i]
        const manhattan = Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
        expect(manhattan).toBe(1)
      }

      const pathSet = new Set(map.path.map((p) => `${p.x},${p.y}`))
      let roadCount = 0
      for (let y = 0; y < map.tiles.length; y += 1) {
        for (let x = 0; x < map.tiles[y].length; x += 1) {
          if (map.tiles[y][x] !== "road") continue
          roadCount += 1
          expect(pathSet.has(`${x},${y}`)).toBe(true)
        }
      }
      expect(roadCount).toBe(pathSet.size)
    }
  })
})
