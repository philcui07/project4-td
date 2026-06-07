import { renderBattlefield } from "@/game/render"
import { GRID_H, GRID_W, getStartBaseHp } from "@/game/specs"
import { useGameStore } from "@/store/gameStore"
import { useEffect, useMemo, useRef, useState } from "react"

export default function BattlefieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  const runtime = useGameStore((s) => s.runtime)
  const phase = useGameStore((s) => s.phase)
  const tileSize = useGameStore((s) => s.tileSize)

  const cssWidth = useMemo(() => GRID_W * tileSize, [tileSize])
  const cssHeight = useMemo(() => GRID_H * tileSize, [tileSize])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setBox({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (phase !== "playing") return
    if (!runtime) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1))
    const scale =
      box.w > 0 && box.h > 0 ? Math.min(1, box.w / Math.max(1, cssWidth), box.h / Math.max(1, cssHeight)) : 1

    canvas.width = Math.round(cssWidth * dpr * scale)
    canvas.height = Math.round(cssHeight * dpr * scale)
    canvas.style.width = `${cssWidth * scale}px`
    canvas.style.height = `${cssHeight * scale}px`
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0)

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
          baseHp: s.baseHp,
          baseHpMax: getStartBaseHp(s.difficulty),
          tileSize: s.tileSize,
          selectedTile: s.selectedTile,
          buildKind: s.buildKind,
        },
        width: cssWidth,
        height: cssHeight,
        dpr: Math.max(1, dpr * scale),
      })
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastRef.current = null
    }
  }, [phase, runtime, cssWidth, cssHeight, tileSize, box.w, box.h])

  const selectTile = useGameStore((s) => s.selectTile)

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center">
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
          style={{ touchAction: "none" }}
          className="block cursor-crosshair rounded-2xl border border-[color:var(--line)] bg-black/20 shadow-[0_22px_80px_rgba(0,0,0,0.6)]"
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
      </div>
    </div>
  )
}
