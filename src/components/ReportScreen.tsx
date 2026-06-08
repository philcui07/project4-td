import Button from "@/components/ui/Button"
import { useGameStore } from "@/store/gameStore"
import { Flag, RotateCcw, Skull, Undo2 } from "lucide-react"
import { useMemo } from "react"

export default function ReportScreen() {
  const result = useGameStore((s) => s.result)
  const difficulty = useGameStore((s) => s.difficulty)
  const waveIndex = useGameStore((s) => s.waveIndex)
  const kills = useGameStore((s) => s.kills)
  const leaks = useGameStore((s) => s.leaks)
  const towersBuilt = useGameStore((s) => s.towersBuilt)
  const moneySpent = useGameStore((s) => s.moneySpent)

  const restartLevel = useGameStore((s) => s.restartLevel)
  const returnToMenu = useGameStore((s) => s.returnToMenu)

  const header = useMemo(() => {
    if (result === "victory") return { title: "战报：胜利", sub: "敌军溃退，前线守住了。", icon: Flag }
    return { title: "战报：失守", sub: "阵地被突破，撤离命令已下达。", icon: Skull }
  }, [result])

  const Icon = header.icon

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col justify-center gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/25 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(242,229,190,0.14),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(139,49,40,0.16),transparent_60%),radial-gradient(circle_at_40%_120%,rgba(255,206,124,0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.38em] text-[color:var(--paper)]/70">After Action Report</div>
            <h1 className="mt-2 font-display text-3xl text-[color:var(--paper)] sm:text-4xl md:text-5xl">{header.title}</h1>
            <p className="mt-2 text-xs text-[color:var(--paper)]/80 sm:text-sm">{header.sub}</p>
          </div>
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brass)] text-black shadow-[0_10px_0_rgba(0,0,0,0.35)]">
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">战况统计</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="已推进波次" value={String(result === "victory" ? waveIndex + 1 : Math.max(0, waveIndex + 1))} />
            <Stat label="击杀" value={String(kills)} />
            <Stat label="漏怪" value={String(leaks)} />
            <Stat label="建造数量" value={String(towersBuilt)} />
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">资源记录</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="难度" value={difficultyLabel(difficulty)} />
            <Stat label="总投入补给" value={String(moneySpent)} />
            <Stat label="战术建议" value={result === "victory" ? "保持火力交叉" : "优先路口覆盖"} wide />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <Button onClick={restartLevel} className="flex-1">
          <RotateCcw className="h-4 w-4" />
          重玩本关
        </Button>
        <Button variant="ghost" onClick={returnToMenu} className="flex-1">
          <Undo2 className="h-4 w-4" />
          返回菜单
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div
      className={[
        "rounded-xl bg-black/25 px-4 py-3 ring-1 ring-[color:var(--line)]",
        wide ? "col-span-2" : "",
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">{label}</div>
      <div className="mt-1 text-base font-semibold text-[color:var(--paper)] sm:text-lg">{value}</div>
    </div>
  )
}

function difficultyLabel(d: string) {
  if (d === "easy") return "简单"
  if (d === "veteran") return "老兵"
  return "标准"
}
