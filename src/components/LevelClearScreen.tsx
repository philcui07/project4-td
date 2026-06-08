import Button from "@/components/ui/Button"
import { useGameStore } from "@/store/gameStore"
import { ArrowRight, CheckCircle2, RotateCcw, Undo2 } from "lucide-react"

export default function LevelClearScreen() {
  const report = useGameStore((s) => s.levelClearReport)
  const confirmLevelClear = useGameStore((s) => s.confirmLevelClear)
  const restartLevel = useGameStore((s) => s.restartLevel)
  const returnToMenu = useGameStore((s) => s.returnToMenu)

  if (!report) {
    return (
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col justify-center gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
        <div className="rounded-2xl border border-[color:var(--line)] bg-black/25 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] sm:p-8">
          <div className="text-xs uppercase tracking-[0.38em] text-[color:var(--paper)]/70">Level Clear</div>
          <h1 className="mt-2 font-display text-3xl text-[color:var(--paper)] sm:text-4xl md:text-5xl">关卡通过</h1>
          <p className="mt-2 text-xs text-[color:var(--paper)]/80 sm:text-sm">成绩数据缺失，返回菜单以继续。</p>
        </div>
        <Button variant="ghost" onClick={returnToMenu}>
          <Undo2 className="h-4 w-4" />
          返回菜单
        </Button>
      </div>
    )
  }

  const levelNo = report.levelIndex + 1
  const nextLevelNo = report.levelIndex + 2

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col justify-center gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/25 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(242,229,190,0.14),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(139,49,40,0.16),transparent_60%),radial-gradient(circle_at_40%_120%,rgba(255,206,124,0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.38em] text-[color:var(--paper)]/70">
              Level {levelNo} Cleared
            </div>
            <h1 className="mt-2 font-display text-3xl text-[color:var(--paper)] sm:text-4xl md:text-5xl">第 {levelNo} 关通过</h1>
            <p className="mt-2 text-xs text-[color:var(--paper)]/80 sm:text-sm">确认后进入第 {nextLevelNo} 关。</p>
          </div>
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brass)] text-black shadow-[0_10px_0_rgba(0,0,0,0.35)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">本关成绩</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="得分" value={String(report.score)} highlight wide />
            <Stat label="击杀" value={String(report.kills)} />
            <Stat label="漏怪" value={String(report.leaks)} />
            <Stat label="建造数量" value={String(report.towersBuilt)} />
            <Stat label="补给投入" value={String(report.moneySpent)} />
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">阵地状态</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="基地血量" value={String(report.baseHp)} />
            <Stat label="下一关" value={`第 ${nextLevelNo} 关`} />
            <Stat label="行动建议" value={report.leaks > 0 ? "优先路口覆盖" : "保持火力交叉"} wide />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <Button onClick={confirmLevelClear} className="flex-1">
          <ArrowRight className="h-4 w-4" />
          进入下一关
        </Button>
        <Button variant="ghost" onClick={restartLevel} className="flex-1">
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

function Stat({
  label,
  value,
  wide,
  highlight,
}: {
  label: string
  value: string
  wide?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={[
        "rounded-xl bg-black/25 px-4 py-3 ring-1 ring-[color:var(--line)]",
        wide ? "col-span-2" : "",
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/60">{label}</div>
      <div
        className={[
          "mt-1 font-semibold text-[color:var(--paper)]",
          highlight ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  )
}
