import Button from "@/components/ui/Button"
import { getTowerSpec } from "@/game/specs"
import { useGameStore } from "@/store/gameStore"
import { Flag, Shield, Skull, X } from "lucide-react"
import { useMemo, useState } from "react"

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
  const [showGuide, setShowGuide] = useState(false)
  const towerGuide = useMemo(() => {
    const mg = getTowerSpec("mg")
    const at = getTowerSpec("at")
    const mortar = getTowerSpec("mortar")
    return [
      { kind: "mg" as const, name: mg.name, cost: mg.cost, range: mg.rangeTiles, rate: mg.fireRate, dmg: mg.damage, note: "对步兵更强" },
      { kind: "at" as const, name: at.name, cost: at.cost, range: at.rangeTiles, rate: at.fireRate, dmg: at.damage, note: "对重甲更强" },
      {
        kind: "mortar" as const,
        name: mortar.name,
        cost: mortar.cost,
        range: mortar.rangeTiles,
        rate: mortar.fireRate,
        dmg: mortar.damage,
        note: `范围伤害 · 最小射程 ${mortar.minRangeTiles ?? 0}`,
      },
    ]
  }, [])

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/25 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(242,229,190,0.12),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(255,206,124,0.12),transparent_55%),radial-gradient(circle_at_60%_120%,rgba(139,49,40,0.14),transparent_55%)]" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.38em] text-[color:var(--paper)]/70">Field Manual TD / V2.0</div>
          <h1 className="mt-2 text-balance font-display text-3xl text-[color:var(--paper)] sm:text-4xl md:text-5xl">
            铁幕前线：小地图塔防 V2.0
          </h1>
          <p className="mt-3 max-w-2xl text-xs leading-6 text-[color:var(--paper)]/80 sm:text-sm">
            在小地图战场上布置机枪、反坦克炮与迫击炮，抵御一波波敌军沿道路突破。每一发弹药都来自你的补给与判断。
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {difficulties.map((d) => {
          const Icon = d.icon
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => startNewGame(d.id)}
              className="group relative overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/20 p-4 text-left shadow-[0_14px_50px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:bg-black/28 focus:outline-none focus:ring-2 focus:ring-[color:var(--brass)]/50 sm:p-5"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(242,229,190,0.18),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(139,49,40,0.16),transparent_60%)]" />
              <div className="relative flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brass)] text-black shadow-[0_8px_0_rgba(0,0,0,0.35)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg text-[color:var(--paper)] sm:text-xl">{d.title}</div>
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

      <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--line)] bg-black/20 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-4">
        <Button variant="ghost" onClick={() => setShowGuide(true)} className="flex-1">
          游戏说明
        </Button>
        <Button onClick={() => startNewGame("normal")} className="flex-1">
          直接开始
        </Button>
      </div>

      {showGuide ? (
        <div className="fixed inset-0 z-50 bg-black/75 px-4 py-6">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[#0b0e0a] shadow-[0_18px_80px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--line)] bg-black/25 px-4 py-3">
              <div className="font-display text-lg text-[color:var(--paper)]">游戏说明</div>
              <Button variant="ghost" onClick={() => setShowGuide(false)} className="h-10 w-10 px-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-4 py-4 text-sm text-[color:var(--paper)]/80">
              <div className="font-semibold text-[color:var(--paper)]">玩法</div>
              <div className="mt-2 grid gap-2 text-sm">
                <div>建造阶段：先选武器，再点空地放置。</div>
                <div>进攻阶段：敌军沿道路前进，进入基地扣耐久。</div>
                <div>补给：击杀获得补给，用于建造/升级。</div>
              </div>

              <div className="mt-5 font-semibold text-[color:var(--paper)]">武器</div>
              <div className="mt-2 grid gap-2">
                {towerGuide.map((t) => (
                  <div key={t.kind} className="rounded-xl bg-black/20 px-4 py-3 ring-1 ring-[color:var(--line)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[color:var(--paper)]">{t.name}</div>
                        <div className="mt-1 text-xs text-[color:var(--paper)]/60">{t.note}</div>
                      </div>
                      <div className="shrink-0 rounded-md bg-[color:var(--paper)]/10 px-2 py-1 text-xs text-[color:var(--paper)]/80">
                        {t.cost} 补给
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--paper)]/70">
                      <span className="rounded-md bg-black/25 px-2 py-1 ring-1 ring-[color:var(--line)]">射程 {t.range.toFixed(1)}</span>
                      <span className="rounded-md bg-black/25 px-2 py-1 ring-1 ring-[color:var(--line)]">射速 {t.rate.toFixed(2)}</span>
                      <span className="rounded-md bg-black/25 px-2 py-1 ring-1 ring-[color:var(--line)]">伤害 {t.dmg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
