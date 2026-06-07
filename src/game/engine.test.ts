import { describe, expect, it } from "vitest"
import { buildWavePlan, createRuntime, getWaveSpec, placeTower, startWave, stepRuntime } from "@/game/engine"
import { getMap, GRID_H, GRID_W } from "@/game/specs"

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
    for (let i = 0; i < 8; i += 1) {
      const w = getWaveSpec(difficulty, 0, i)
      expect(w.entries.length).toBeGreaterThan(0)
    }
    expect(GRID_W).toBe(10)
    expect(GRID_H).toBe(5)
  })
})
