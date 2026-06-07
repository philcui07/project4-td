import { renderBattlefield } from "@/game/render"
import { GRID_H, GRID_W } from "@/game/specs"
import { useGameStore } from "@/store/gameStore"
import { useEffect, useMemo, useRef } from "react"

export default function BattlefieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)

  const runtime = useGameStore((s) => s.runtime)
  const phase = useGameStore((s) => s.phase)
  const tileSize = useGameStore((s) => s.tileSize)

  const cssWidth = useMemo(() => GRID_W * tileSize, [tileSize])
  const cssHeight = useMemo(() => GRID_H * tileSize, [tileSize])

  useEffect(() => {
    if (phase !== "playing") return
    if (!runtime) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1))
    canvas.width = Math.round(cssWidth * dpr)
    canvas.height = Math.round(cssHeight * dpr)
    canvas.style.width = `${cssWidth}px`
    canvas.style.height = `${cssHeight}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop)
      const last = lastRef.current ?? now
      lastRef.current = now
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))

      const s = useGameStore.getState()
      if (s.phase !== "playing" || !s.runtime) return
      if (s.waveState === "combat") s.tick(dt * s.speed)

      renderBattlefield({
        ctx,
        runtime: s.runtime,
        state: {
          difficulty: s.difficulty,
          levelIndex: s.levelIndex,
          waveIndex: s.waveIndex,
          tileSize: s.tileSize,
          selectedTile: s.selectedTile,
          buildKind: s.buildKind,
        },
        width: cssWidth,
        height: cssHeight,
        dpr,
      })
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastRef.current = null
    }
  }, [phase, runtime, cssWidth, cssHeight, tileSize])

  const selectTile = useGameStore((s) => s.selectTile)

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = Math.floor(((e.clientX - rect.left) / rect.width) * GRID_W)
          const y = Math.floor(((e.clientY - rect.top) / rect.height) * GRID_H)
          if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return
          selectTile({ x, y })
        }}
        className="block max-w-full cursor-crosshair rounded-2xl border border-[color:var(--line)] bg-black/20 shadow-[0_22px_80px_rgba(0,0,0,0.6)]"
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
    </div>
  )
}
