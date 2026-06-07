import BattlefieldCanvas from "@/components/BattlefieldCanvas"
import Button from "@/components/ui/Button"
import { LEVEL_COUNT, WAVES_PER_LEVEL, getTowerSpec, getTowerStats } from "@/game/specs"
import type { TowerKind } from "@/game/types"
import { useGameStore } from "@/store/gameStore"
import { BadgeDollarSign, Gauge, Pause, Play, Swords, Undo2 } from "lucide-react"
import { useMemo } from "react"

const buildCards: { kind: TowerKind; blurb: string }[] = [
  { kind: "mg", blurb: "射速快，压制步兵。对重甲乏力。" },
  { kind: "at", blurb: "单发高伤，专治坦克。容错低。" },
  { kind: "mortar", blurb: "范围轰炸，有最小射程。" },
]

export default function GameScreen() {
  const runtime = useGameStore((s) => s.runtime)
  const towersVersion = useGameStore((s) => s.towersVersion)
  const difficulty = useGameStore((s) => s.difficulty)
  const levelIndex = useGameStore((s) => s.levelIndex)
  const waveIndex = useGameStore((s) => s.waveIndex)
  const waveState = useGameStore((s) => s.waveState)
  const supply = useGameStore((s) => s.supply)
  const baseHp = useGameStore((s) => s.baseHp)
  const speed = useGameStore((s) => s.speed)
  const buildKind = useGameStore((s) => s.buildKind)
  const selectedTowerId = useGameStore((s) => s.selectedTowerId)

  const nextWave = useGameStore((s) => s.nextWave)
  const togglePause = useGameStore((s) => s.togglePause)
  const setSpeed = useGameStore((s) => s.setSpeed)
  const setBuildKind = useGameStore((s) => s.setBuildKind)
  const upgradeSelected = useGameStore((s) => s.upgradeSelected)
  const sellSelected = useGameStore((s) => s.sellSelected)
  const returnToMenu = useGameStore((s) => s.returnToMenu)

  const totalWaves = useMemo(() => WAVES_PER_LEVEL, [])

  const selectedTower = useMemo(() => {
    const _v = towersVersion
    void _v
    if (!runtime || !selectedTowerId) return null
    return runtime.towers.find((t) => t.id === selectedTowerId) ?? null
  }, [runtime, selectedTowerId, towersVersion])

  return (
    <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-5 px-4 py-6 lg:flex-row lg:items-start">
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--line)] bg-black/20 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 ring-1 ring-[color:var(--line)]">
              <Swords className="h-4 w-4 text-[color:var(--paper)]/80" />
              <div className="text-sm text-[color:var(--paper)]">
                第 <span className="font-semibold">{levelIndex + 1}</span> 关 / {LEVEL_COUNT} · 第{" "}
                <span className="font-semibold">{Math.min(totalWaves, waveIndex + 1)}</span> 波 / {totalWaves}
              </div>
              <div className="ml-2 rounded-md bg-[color:var(--paper)]/10 px-2 py-0.5 text-xs uppercase tracking-[0.18em] text-[color:var(--paper)]/70">
                {waveState === "build" ? "建造" : waveState === "paused" ? "暂停" : "战斗"}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 ring-1 ring-[color:var(--line)]">
              <BadgeDollarSign className="h-4 w-4 text-[color:var(--brass)]" />
              <div className="text-sm text-[color:var(--paper)]">
                补给 <span className="font-semibold text-[color:var(--brass)]">{supply}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 ring-1 ring-[color:var(--line)]">
              <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--red)] shadow-[0_0_0_4px_rgba(139,49,40,0.18)]" />
              <div className="text-sm text-[color:var(--paper)]">
                基地耐久 <span className="font-semibold">{baseHp}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {waveState === "build" ? (
              <Button onClick={nextWave}>
                <Play className="h-4 w-4" />
                开始下一波
              </Button>
            ) : (
              <Button variant="ghost" onClick={togglePause}>
                {waveState === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {waveState === "paused" ? "继续" : "暂停"}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setSpeed(speed === 1 ? 2 : 1)}
              disabled={difficulty === "veteran"}
            >
              <Gauge className="h-4 w-4" />
              {speed}×
            </Button>
            <Button variant="ghost" onClick={returnToMenu}>
              <Undo2 className="h-4 w-4" />
              退出
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-4 lg:items-start">
          <BattlefieldCanvas />
          <div className="w-full rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 text-sm text-[color:var(--paper)]/75 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 ring-1 ring-[color:var(--line)]">
                <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">操作</span>
                <span className="text-[color:var(--paper)]">点击格子选择</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 ring-1 ring-[color:var(--line)]">
                <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">建造</span>
                <span className="text-[color:var(--paper)]">先选塔再点可建造格</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 ring-1 ring-[color:var(--line)]">
                <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">提示</span>
                <span className="text-[color:var(--paper)]">道路格不可建造</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-[360px]">
        <div className="sticky top-6 flex flex-col gap-4">
          <div className="rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-2">
              <div className="font-display text-lg text-[color:var(--paper)]">建造面板</div>
              <Button variant="ghost" className="h-9 px-3" onClick={() => setBuildKind(null)}>
                取消
              </Button>
            </div>
            <div className="mt-3 grid gap-3">
              {buildCards.map((c) => {
                const spec = getTowerSpec(c.kind)
                const active = buildKind === c.kind
                return (
                  <button
                    key={c.kind}
                    type="button"
                    onClick={() => setBuildKind(active ? null : c.kind)}
                    disabled={waveState !== "build" && waveState !== "paused"}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      active ? "border-[color:var(--brass)] bg-black/35" : "border-[color:var(--line)] bg-black/20 hover:bg-black/28",
                      waveState !== "build" && waveState !== "paused" ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-[color:var(--paper)]">{spec.name}</div>
                      <div className="rounded-md bg-[color:var(--paper)]/10 px-2 py-1 text-xs text-[color:var(--paper)]/80">
                        {spec.cost} 补给
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-[color:var(--paper)]/70">{c.blurb}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[color:var(--paper)]/70">
                      <span className="rounded-md bg-black/25 px-2 py-1 ring-1 ring-[color:var(--line)]">射程 {spec.rangeTiles.toFixed(1)}</span>
                      <span className="rounded-md bg-black/25 px-2 py-1 ring-1 ring-[color:var(--line)]">射速 {spec.fireRate.toFixed(1)}/s</span>
                      <span className="rounded-md bg-black/25 px-2 py-1 ring-1 ring-[color:var(--line)]">伤害 {spec.damage}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="mt-3 text-xs text-[color:var(--paper)]/60">
              建造阶段与暂停时可放置。战斗中先撑住，必要时暂停补强。
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="font-display text-lg text-[color:var(--paper)]">选中单位</div>
            {selectedTower ? (
              <div className="mt-3">
                {(() => {
                  const spec = getTowerSpec(selectedTower.kind)
                  const cur = getTowerStats(selectedTower.kind, selectedTower.level)
                  const nextCost = spec.upgradeCosts[selectedTower.level] ?? null
                  const next =
                    nextCost == null ? null : getTowerStats(selectedTower.kind, Math.min(selectedTower.level + 1, spec.upgradeCosts.length))
                  const canUpgrade = nextCost != null && supply >= nextCost
                  const atMax = nextCost == null
                  return (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-[color:var(--paper)]">{spec.name}</div>
                          <div className="mt-1 text-sm text-[color:var(--paper)]/70">
                            等级 {selectedTower.level} · 格子 ({selectedTower.tile.x + 1},{selectedTower.tile.y + 1})
                          </div>
                        </div>
                        <div className="rounded-md bg-[color:var(--paper)]/10 px-2 py-1 text-xs text-[color:var(--paper)]/80">
                          {selectedTower.kind.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-[color:var(--paper)]/70">
                        <div className="rounded-lg bg-black/25 px-3 py-2 ring-1 ring-[color:var(--line)]">
                          射程
                          <div className="mt-1 text-sm font-semibold text-[color:var(--paper)]">{cur.rangeTiles.toFixed(1)}</div>
                          {next ? <div className="mt-1 text-[color:var(--paper)]/60">→ {next.rangeTiles.toFixed(1)}</div> : null}
                        </div>
                        <div className="rounded-lg bg-black/25 px-3 py-2 ring-1 ring-[color:var(--line)]">
                          射速
                          <div className="mt-1 text-sm font-semibold text-[color:var(--paper)]">{cur.fireRate.toFixed(1)}</div>
                          {next ? <div className="mt-1 text-[color:var(--paper)]/60">→ {next.fireRate.toFixed(1)}</div> : null}
                        </div>
                        <div className="rounded-lg bg-black/25 px-3 py-2 ring-1 ring-[color:var(--line)]">
                          伤害
                          <div className="mt-1 text-sm font-semibold text-[color:var(--paper)]">{Math.round(cur.damage)}</div>
                          {next ? <div className="mt-1 text-[color:var(--paper)]/60">→ {Math.round(next.damage)}</div> : null}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={upgradeSelected} className="flex-1" disabled={!canUpgrade || atMax}>
                          升级{nextCost != null ? `（${nextCost}）` : "（已满级）"}
                        </Button>
                        <Button variant="danger" onClick={sellSelected} className="flex-1">
                          拆除
                        </Button>
                      </div>
                      <div className="text-xs text-[color:var(--paper)]/60">升级与拆除不消耗回合。拆除返还部分补给。</div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="mt-3 text-sm text-[color:var(--paper)]/70">未选中任何防御塔。点击地图上的塔查看与升级。</div>
            )}
          </div>

          <Button variant="ghost" onClick={returnToMenu} className="w-full">
            <Undo2 className="h-4 w-4" />
            撤回到菜单
          </Button>
        </div>
      </aside>
    </div>
  )
}
