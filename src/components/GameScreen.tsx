import BattlefieldCanvas from "@/components/BattlefieldCanvas"
import { LEVEL_COUNT, WAVES_PER_LEVEL, getTowerSpec } from "@/game/specs"
import { getTowerSprite } from "@/game/sprites"
import type { TowerKind } from "@/game/types"
import { useGameStore } from "@/store/gameStore"
import { ArrowUp, BadgeDollarSign, Gauge, Pause, Play, Trash2, Undo2, X } from "lucide-react"
import { useEffect, useMemo } from "react"

export default function GameScreen() {
  const runtime = useGameStore((s) => s.runtime)
  const towersVersion = useGameStore((s) => s.towersVersion)
  const difficulty = useGameStore((s) => s.difficulty)
  const levelIndex = useGameStore((s) => s.levelIndex)
  const waveIndex = useGameStore((s) => s.waveIndex)
  const waveState = useGameStore((s) => s.waveState)
  const waveAutoStartAt = useGameStore((s) => s.waveAutoStartAt)
  const waveAutoStartWaveIndex = useGameStore((s) => s.waveAutoStartWaveIndex)
  const supply = useGameStore((s) => s.supply)
  const speed = useGameStore((s) => s.speed)
  const buildKind = useGameStore((s) => s.buildKind)
  const selectedTowerId = useGameStore((s) => s.selectedTowerId)

  const nextWave = useGameStore((s) => s.nextWave)
  const togglePause = useGameStore((s) => s.togglePause)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const setBuildKind = useGameStore((s) => s.setBuildKind)
  const clearWaveAutoStart = useGameStore((s) => s.clearWaveAutoStart)
  const upgradeSelected = useGameStore((s) => s.upgradeSelected)
  const sellSelected = useGameStore((s) => s.sellSelected)
  const returnToMenu = useGameStore((s) => s.returnToMenu)

  const totalWaves = useMemo(() => WAVES_PER_LEVEL, [])
  const buildEnabled = waveState === "build" || waveState === "paused"
  void difficulty

  const selectedTower = useMemo(() => {
    const _v = towersVersion
    void _v
    if (!runtime || !selectedTowerId) return null
    return runtime.towers.find((t) => t.id === selectedTowerId) ?? null
  }, [runtime, selectedTowerId, towersVersion])

  const selectedActions = useMemo(() => {
    const _v = towersVersion
    void _v
    if (!selectedTower) return null
    const spec = getTowerSpec(selectedTower.kind)
    const nextCost = spec.upgradeCosts[selectedTower.level] ?? null
    const canUpgrade = nextCost != null && supply >= nextCost
    return { spec, nextCost, canUpgrade, atMax: nextCost == null }
  }, [selectedTower, supply, towersVersion])

  useEffect(() => {
    if (waveState !== "build") return
    if (!waveAutoStartAt || waveAutoStartWaveIndex == null) return
    if (waveIndex !== waveAutoStartWaveIndex) return
    if (waveIndex <= 0) return
    const delay = Math.max(0, waveAutoStartAt - Date.now())
    const t = window.setTimeout(() => {
      nextWave()
      clearWaveAutoStart()
    }, delay)
    return () => window.clearTimeout(t)
  }, [clearWaveAutoStart, nextWave, waveAutoStartAt, waveAutoStartWaveIndex, waveIndex, waveState])

  return (
    <div className="mx-auto flex h-full w-full max-w-[1220px] flex-col gap-2 px-2 py-2 sm:gap-3 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="shrink-0 flex flex-nowrap items-center justify-between gap-1 rounded-2xl border border-[color:var(--line)] bg-black/20 px-1.5 py-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:gap-2 sm:px-3 sm:py-2 lg:px-4">
        <div className="flex min-w-0 flex-nowrap items-center gap-1 sm:gap-2">
          <div className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-black/25 px-2 py-1.5 ring-1 ring-[color:var(--line)]">
            <div className="text-[10px] leading-none text-[color:var(--paper)] sm:text-sm">
              L{levelIndex + 1}/{LEVEL_COUNT} W{Math.min(totalWaves, waveIndex + 1)}/{totalWaves}
            </div>
          </div>

          <div className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-black/25 px-2 py-1.5 ring-1 ring-[color:var(--line)]">
            <BadgeDollarSign className="h-3.5 w-3.5 text-[color:var(--brass)] sm:h-4 sm:w-4" />
            <div className="text-[10px] font-semibold leading-none text-[color:var(--brass)] sm:text-sm">{supply}</div>
          </div>

          <div className="flex flex-nowrap items-center gap-1 sm:gap-2">
            {(["mg", "at", "mortar"] as TowerKind[]).map((kind) => {
              const spec = getTowerSpec(kind)
              const active = buildKind === kind
              const sprite = getTowerSprite(kind)
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setBuildKind(active ? null : kind)}
                  disabled={!buildEnabled}
                  className={[
                    "relative inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-black/20 transition disabled:opacity-50 sm:h-10 sm:w-10",
                    active ? "border-[color:var(--brass)] bg-black/35" : "border-[color:var(--line)] hover:bg-black/28",
                  ].join(" ")}
                >
                  <img src={sprite.src} alt={spec.name} className="h-5 w-5 sm:h-6 sm:w-6" />
                  <div className="absolute -right-1 -top-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-[color:var(--paper)] ring-1 ring-[color:var(--line)]">
                    {spec.cost}
                  </div>
                </button>
              )
            })}

            {buildKind ? (
              <button
                type="button"
                onClick={() => setBuildKind(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 ring-1 ring-[color:var(--line)] hover:bg-black/28 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4 text-[color:var(--paper)]" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
          {selectedTower && selectedActions ? (
            <>
              <button
                type="button"
                onClick={upgradeSelected}
                disabled={!selectedActions.canUpgrade || selectedActions.atMax}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 text-[color:var(--paper)] ring-1 ring-[color:var(--line)] disabled:opacity-50 sm:h-10 sm:w-10"
              >
                <ArrowUp className="h-4 w-4 text-[color:var(--brass)]" />
                <div className="absolute -right-1 -top-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-[color:var(--paper)] ring-1 ring-[color:var(--line)]">
                  {selectedActions.nextCost ?? "MAX"}
                </div>
              </button>
              <button
                type="button"
                onClick={sellSelected}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--red)] text-[color:var(--paper)] shadow-[0_6px_0_rgba(0,0,0,0.35)] sm:h-10 sm:w-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : null}

          {waveState === "build" && waveIndex === 0 ? (
            <button
              type="button"
              onClick={nextWave}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brass)] text-black shadow-[0_6px_0_rgba(0,0,0,0.35)] sm:h-10 sm:w-10"
            >
              <Play className="h-4 w-4" />
            </button>
          ) : null}
          {waveState !== "build" ? (
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 text-[color:var(--paper)] ring-1 ring-[color:var(--line)] hover:bg-black/28 sm:h-10 sm:w-10"
            >
              {waveState === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setSpeed(speed === 1 ? 2 : 1)}
            disabled={difficulty === "veteran"}
            className="inline-flex h-9 items-center gap-1 rounded-xl bg-black/20 px-2 text-[10px] font-semibold leading-none text-[color:var(--paper)] ring-1 ring-[color:var(--line)] disabled:opacity-50 sm:h-10 sm:gap-2 sm:px-3 sm:text-xs"
          >
            <Gauge className="h-4 w-4" />
            <span>{speed}×</span>
          </button>
          <button
            type="button"
            onClick={returnToMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 text-[color:var(--paper)] ring-1 ring-[color:var(--line)] hover:bg-black/28 sm:h-10 sm:w-10"
          >
            <Undo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/10 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 p-2">
          <BattlefieldCanvas />
        </div>
      </div>
    </div>
  )
}
