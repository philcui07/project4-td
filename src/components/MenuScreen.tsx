import Button from "@/components/ui/Button"
import { useGameStore } from "@/store/gameStore"
import { Flag, Shield, Skull } from "lucide-react"

const difficulties = [
  {
    id: "easy" as const,
    title: "简单",
    desc: "补给更充足，敌军更脆弱。",
    icon: Shield,
  },
  {
    id: "normal" as const,
    title: "标准",
    desc: "推荐难度，节奏紧凑。",
    icon: Flag,
  },
  {
    id: "veteran" as const,
    title: "老兵",
    desc: "敌军更坚韧，倍速受限。",
    icon: Skull,
  },
]

export default function MenuScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/25 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(242,229,190,0.12),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(255,206,124,0.12),transparent_55%),radial-gradient(circle_at_60%_120%,rgba(139,49,40,0.14),transparent_55%)]" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.38em] text-[color:var(--paper)]/70">Field Manual TD / 5×5</div>
          <h1 className="mt-2 text-balance font-display text-4xl text-[color:var(--paper)] md:text-5xl">
            铁幕前线：小地图塔防
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--paper)]/80">
            在 5×5 战场上布置机枪、反坦克炮与迫击炮，抵御一波波敌军沿道路突破。每一发弹药都来自你的补给与判断。
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {difficulties.map((d) => {
          const Icon = d.icon
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => startNewGame(d.id)}
              className="group relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/20 p-5 text-left shadow-[0_14px_50px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:bg-black/28 focus:outline-none focus:ring-2 focus:ring-[color:var(--brass)]/50"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(242,229,190,0.18),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(139,49,40,0.16),transparent_60%)]" />
              <div className="relative flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brass)] text-black shadow-[0_8px_0_rgba(0,0,0,0.35)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xl text-[color:var(--paper)]">{d.title}</div>
                  <div className="mt-1 text-sm text-[color:var(--paper)]/75">{d.desc}</div>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--paper)]/70">
                    <span className="h-[1px] w-8 bg-[color:var(--line)]" />
                    点击开始
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-start gap-3 rounded-2xl border border-[color:var(--line)] bg-black/20 p-5 text-sm text-[color:var(--paper)]/75 md:flex-row md:items-center md:justify-between">
        <div className="leading-6">
          <span className="font-semibold text-[color:var(--paper)]">提示：</span>
          先在建造阶段把关键路口火力覆盖，再开波。迫击炮有最小射程，别贴脸放。
        </div>
        <Button variant="ghost" onClick={() => startNewGame("normal")} className="w-full md:w-auto">
          直接开始（标准）
        </Button>
      </div>
    </div>
  )
}

