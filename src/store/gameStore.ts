import { create } from "zustand"
import { createRuntime, getTotalWaves, getWaveSpec, isWaveDone, placeTower, sellTower, startWave, stepRuntime, upgradeTower } from "@/game/engine"
import { getMap, getStartBaseHp, getStartSupply, getTowerSpec, LEVEL_COUNT, WAVES_PER_LEVEL } from "@/game/specs"
import type { Difficulty, GamePhase, GameRuntime, TilePos, TowerKind, WaveState } from "@/game/types"

export type GameResult = "victory" | "defeat" | null

export type LevelClearReport = {
  levelIndex: number
  kills: number
  leaks: number
  towersBuilt: number
  moneySpent: number
  baseHp: number
  score: number
}

type GameStore = {
  phase: GamePhase
  difficulty: Difficulty
  result: GameResult
  runtime: GameRuntime | null
  tileSize: number

  levelIndex: number
  waveIndex: number
  waveState: WaveState
  waveAutoStartAt: number | null
  waveAutoStartWaveIndex: number | null
  speed: 1 | 2
  supply: number
  baseHp: number

  kills: number
  leaks: number
  towersBuilt: number
  moneySpent: number
  towersVersion: number

  levelStartKills: number
  levelStartLeaks: number
  levelStartTowersBuilt: number
  levelStartMoneySpent: number
  levelClearReport: LevelClearReport | null

  selectedTile: TilePos | null
  selectedTowerId: string | null
  buildKind: TowerKind | null

  startNewGame: (difficulty: Difficulty) => void
  restartLevel: () => void
  returnToMenu: () => void
  tick: (dt: number) => void
  nextWave: () => void
  togglePause: () => void
  setSpeed: (speed: 1 | 2) => void
  setBuildKind: (kind: TowerKind | null) => void
  clearWaveAutoStart: () => void
  selectTile: (tile: TilePos) => void
  upgradeSelected: () => void
  sellSelected: () => void
  confirmLevelClear: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "menu",
  difficulty: "normal",
  result: null,
  runtime: null,
  tileSize: 96,

  levelIndex: 0,
  waveIndex: 0,
  waveState: "build",
  waveAutoStartAt: null,
  waveAutoStartWaveIndex: null,
  speed: 1,
  supply: 0,
  baseHp: 0,

  kills: 0,
  leaks: 0,
  towersBuilt: 0,
  moneySpent: 0,
  towersVersion: 0,

  levelStartKills: 0,
  levelStartLeaks: 0,
  levelStartTowersBuilt: 0,
  levelStartMoneySpent: 0,
  levelClearReport: null,

  selectedTile: null,
  selectedTowerId: null,
  buildKind: null,

  startNewGame: (difficulty) => {
    const runtime = createRuntime(getMap(0))
    set({
      phase: "playing",
      difficulty,
      result: null,
      runtime,
      levelIndex: 0,
      waveIndex: 0,
      waveState: "build",
      waveAutoStartAt: null,
      waveAutoStartWaveIndex: null,
      speed: difficulty === "veteran" ? 1 : 1,
      supply: getStartSupply(difficulty),
      baseHp: getStartBaseHp(difficulty),
      kills: 0,
      leaks: 0,
      towersBuilt: 0,
      moneySpent: 0,
      towersVersion: 0,
      levelStartKills: 0,
      levelStartLeaks: 0,
      levelStartTowersBuilt: 0,
      levelStartMoneySpent: 0,
      levelClearReport: null,
      selectedTile: null,
      selectedTowerId: null,
      buildKind: null,
    })
  },

  restartLevel: () => {
    const s = get()
    if (s.phase === "menu") return
    const runtime = createRuntime(getMap(s.levelIndex))
    set({
      phase: "playing",
      result: null,
      runtime,
      waveIndex: 0,
      waveState: "build",
      waveAutoStartAt: null,
      waveAutoStartWaveIndex: null,
      supply: getStartSupply(s.difficulty),
      baseHp: getStartBaseHp(s.difficulty),
      selectedTile: null,
      selectedTowerId: null,
      buildKind: null,
      towersVersion: s.towersVersion + 1,
      kills: s.levelStartKills,
      leaks: s.levelStartLeaks,
      towersBuilt: s.levelStartTowersBuilt,
      moneySpent: s.levelStartMoneySpent,
      levelClearReport: null,
    })
  },

  returnToMenu: () => {
    set({
      phase: "menu",
      result: null,
      runtime: null,
      selectedTile: null,
      selectedTowerId: null,
      buildKind: null,
      levelIndex: 0,
      waveIndex: 0,
      waveState: "build",
      waveAutoStartAt: null,
      waveAutoStartWaveIndex: null,
      supply: 0,
      baseHp: 0,
      speed: 1,
      levelStartKills: 0,
      levelStartLeaks: 0,
      levelStartTowersBuilt: 0,
      levelStartMoneySpent: 0,
      levelClearReport: null,
    })
  },

  tick: (dt) => {
    const s = get()
    if (s.phase !== "playing") return
    if (!s.runtime) return
    if (s.waveState !== "combat") return

    let supplyAdd = 0
    let killAdd = 0
    let leakCount = 0
    stepRuntime({
      runtime: s.runtime,
      difficulty: s.difficulty,
      levelIndex: s.levelIndex,
      waveIndex: s.waveIndex,
      dt,
      tileSize: s.tileSize,
      onEnemyKilled: ({ count, reward }) => {
        killAdd += count
        supplyAdd += reward
      },
      onEnemyLeaked: () => {
        leakCount += 1
      },
    })

    if (supplyAdd > 0 || leakCount > 0 || killAdd > 0) {
      const nextBase = Math.max(0, s.baseHp - leakCount)
      const nextSupply = s.supply + supplyAdd
      const defeated = nextBase <= 0
      set({
        supply: nextSupply,
        baseHp: nextBase,
        kills: s.kills + killAdd,
        leaks: s.leaks + leakCount,
        phase: defeated ? "report" : s.phase,
        result: defeated ? "defeat" : s.result,
        waveState: defeated ? "paused" : s.waveState,
      })
      if (defeated) return
    }

    if (isWaveDone(s.runtime)) {
      const lastWaveInLevel = s.waveIndex >= WAVES_PER_LEVEL - 1
      if (!lastWaveInLevel) {
        const nextWaveIndex = s.waveIndex + 1
        set({
          waveIndex: nextWaveIndex,
          waveState: "build",
          buildKind: null,
          selectedTowerId: null,
          waveAutoStartAt: Date.now() + 3000,
          waveAutoStartWaveIndex: nextWaveIndex,
        })
        return
      }

      const lastLevel = s.levelIndex >= LEVEL_COUNT - 1
      if (lastLevel) {
        set({ phase: "report", result: "victory", waveState: "paused" })
        return
      }

      const levelKills = s.kills - s.levelStartKills
      const levelLeaks = s.leaks - s.levelStartLeaks
      const levelTowersBuilt = s.towersBuilt - s.levelStartTowersBuilt
      const levelMoneySpent = s.moneySpent - s.levelStartMoneySpent
      const scoreRaw =
        150 +
        levelKills * 12 +
        Math.round(Math.max(0, s.baseHp) * 18) -
        levelLeaks * 25 -
        Math.round(levelMoneySpent * 0.14)
      const score = Math.max(0, scoreRaw)

      set({
        phase: "level_clear",
        waveState: "paused",
        buildKind: null,
        selectedTile: null,
        selectedTowerId: null,
        levelClearReport: {
          levelIndex: s.levelIndex,
          kills: levelKills,
          leaks: levelLeaks,
          towersBuilt: levelTowersBuilt,
          moneySpent: levelMoneySpent,
          baseHp: s.baseHp,
          score,
        },
      })
    }
  },

  nextWave: () => {
    const s = get()
    if (s.phase !== "playing") return
    if (!s.runtime) return
    if (s.waveState !== "build") return
    const total = getTotalWaves(s.difficulty, s.levelIndex)
    if (s.waveIndex >= total) return
    startWave(s.runtime, getWaveSpec(s.difficulty, s.levelIndex, s.waveIndex))
    set({
      waveState: "combat",
      buildKind: null,
      selectedTowerId: null,
      waveAutoStartAt: null,
      waveAutoStartWaveIndex: null,
    })
  },

  togglePause: () => {
    const s = get()
    if (s.phase !== "playing") return
    if (s.waveState === "combat") set({ waveState: "paused" })
    else if (s.waveState === "paused") set({ waveState: "combat" })
  },

  setSpeed: (speed) => {
    const s = get()
    void s
    set({ speed })
  },

  setBuildKind: (kind) => set({ buildKind: kind }),

  clearWaveAutoStart: () => set({ waveAutoStartAt: null, waveAutoStartWaveIndex: null }),

  selectTile: (tile) => {
    const s = get()
    if (s.phase !== "playing") return
    if (!s.runtime) return

    const tower = s.runtime.towers.find((t) => t.tile.x === tile.x && t.tile.y === tile.y) ?? null

    if (s.buildKind && (s.waveState === "build" || s.waveState === "paused") && !tower) {
      const kind = s.buildKind
      const cost = getTowerSpec(kind).cost
      const tileKind = s.runtime.map.tiles[tile.y]?.[tile.x]
      if (tileKind === "buildable" && s.supply >= cost) {
        const placed = placeTower(s.runtime, kind, tile)
        set({
          supply: s.supply - cost,
          moneySpent: s.moneySpent + cost,
          towersBuilt: s.towersBuilt + 1,
          towersVersion: s.towersVersion + 1,
          selectedTile: tile,
          selectedTowerId: placed.id,
        })
        return
      }
    }

    set({
      selectedTile: tile,
      selectedTowerId: tower?.id ?? null,
    })
  },

  upgradeSelected: () => {
    const s = get()
    if (!s.runtime) return
    if (!s.selectedTowerId) return
    const tower = s.runtime.towers.find((t) => t.id === s.selectedTowerId)
    if (!tower) return
    const spec = getTowerSpec(tower.kind)
    if (tower.level >= spec.upgradeCosts.length) return
    const cost = spec.upgradeCosts[tower.level]
    if (s.supply < cost) return
    const res = upgradeTower(s.runtime, tower.id)
    if (!res) return
    set({ supply: s.supply - cost, moneySpent: s.moneySpent + cost, towersVersion: s.towersVersion + 1 })
  },

  sellSelected: () => {
    const s = get()
    if (!s.runtime) return
    if (!s.selectedTowerId) return
    const refund = sellTower(s.runtime, s.selectedTowerId)
    if (refund == null) return
    set({
      supply: s.supply + refund,
      towersVersion: s.towersVersion + 1,
      selectedTowerId: null,
      selectedTile: s.selectedTile,
    })
  },

  confirmLevelClear: () => {
    const s = get()
    if (s.phase !== "level_clear") return
    if (!s.runtime) return
    const nextLevel = s.levelIndex + 1
    if (nextLevel >= LEVEL_COUNT) return

    s.runtime.map = getMap(nextLevel)
    s.runtime.enemies = []
    s.runtime.projectiles = []
    s.runtime.blasts = []
    s.runtime.towers = []
    s.runtime.waveSpawnPlan = []
    s.runtime.waveClock = 0
    s.runtime.waveSpawnCursor = 0

    set({
      phase: "playing",
      levelIndex: nextLevel,
      waveIndex: 0,
      waveState: "build",
      waveAutoStartAt: null,
      waveAutoStartWaveIndex: null,
      supply: getStartSupply(s.difficulty),
      baseHp: getStartBaseHp(s.difficulty),
      buildKind: null,
      selectedTile: null,
      selectedTowerId: null,
      towersVersion: s.towersVersion + 1,
      levelStartKills: s.kills,
      levelStartLeaks: s.leaks,
      levelStartTowersBuilt: s.towersBuilt,
      levelStartMoneySpent: s.moneySpent,
      levelClearReport: null,
    })
  },
}))
