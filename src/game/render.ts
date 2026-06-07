import { getEnemySpec, getTowerStats, GRID_H, GRID_W } from "@/game/specs"
import { getBaseSprite, getEnemySprite, getTowerSprite } from "@/game/sprites"
import type { Difficulty, GameRuntime, TilePos, TowerKind } from "@/game/types"

type RenderState = {
  difficulty: Difficulty
  levelIndex: number
  waveIndex: number
  baseHp: number
  baseHpMax: number
  tileSize: number
  selectedTile: TilePos | null
  buildKind: TowerKind | null
}

let noisePattern: CanvasPattern | null = null
let noisePatternKey = ""

let roadPattern: CanvasPattern | null = null
let roadPatternKey = ""

function getNoisePattern(ctx: CanvasRenderingContext2D, dpr: number) {
  const key = `${Math.round(dpr * 100)}`
  if (noisePattern && noisePatternKey === key) return noisePattern
  const c = document.createElement("canvas")
  const s = Math.max(96, Math.round(128 * dpr))
  c.width = s
  c.height = s
  const nctx = c.getContext("2d")
  if (!nctx) return null
  const img = nctx.createImageData(s, s)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 175 + Math.floor(Math.random() * 55)
    const a = Math.floor(Math.random() * 28)
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = a
  }
  nctx.putImageData(img, 0, 0)
  noisePattern = ctx.createPattern(c, "repeat")
  noisePatternKey = key
  return noisePattern
}

function getRoadPattern(ctx: CanvasRenderingContext2D, dpr: number) {
  const key = `${Math.round(dpr * 100)}`
  if (roadPattern && roadPatternKey === key) return roadPattern
  const c = document.createElement("canvas")
  const s = Math.max(64, Math.round(72 * dpr))
  c.width = s
  c.height = s
  const rctx = c.getContext("2d")
  if (!rctx) return null

  rctx.clearRect(0, 0, s, s)
  rctx.globalAlpha = 0.95
  rctx.fillStyle = "rgba(0,0,0,0.55)"
  rctx.beginPath()
  rctx.arc(s * 0.32, s * 0.28, s * 0.11, 0, Math.PI * 2)
  rctx.fill()

  rctx.fillRect(s * 0.25, s * 0.38, s * 0.16, s * 0.18)
  rctx.fillRect(s * 0.24, s * 0.56, s * 0.08, s * 0.2)
  rctx.fillRect(s * 0.34, s * 0.56, s * 0.08, s * 0.2)

  rctx.strokeStyle = "rgba(0,0,0,0.55)"
  rctx.lineWidth = Math.max(2, Math.round(2 * dpr))
  rctx.beginPath()
  rctx.moveTo(s * 0.38, s * 0.42)
  rctx.lineTo(s * 0.78, s * 0.26)
  rctx.stroke()

  rctx.fillStyle = "rgba(0,0,0,0.55)"
  rctx.fillRect(s * 0.27, s * 0.47, s * 0.13, s * 0.13)

  roadPattern = ctx.createPattern(c, "repeat")
  roadPatternKey = key
  return roadPattern
}

export function renderBattlefield(args: {
  ctx: CanvasRenderingContext2D
  runtime: GameRuntime
  state: RenderState
  width: number
  height: number
  dpr: number
}) {
  const { ctx, runtime, state, width, height, dpr } = args
  const { tileSize } = state
  ctx.clearRect(0, 0, width, height)

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, "#0b0e0a")
  bg.addColorStop(1, "#12160f")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.fillStyle = "#2a3425"
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  const pattern = getNoisePattern(ctx, dpr)
  if (pattern) {
    ctx.save()
    ctx.globalAlpha = 0.55
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }

  drawGrid({ ctx, runtime, tileSize, dpr, baseHp: state.baseHp, baseHpMax: state.baseHpMax })
  drawEntities({ ctx, runtime, tileSize, difficulty: state.difficulty, levelIndex: state.levelIndex, waveIndex: state.waveIndex })
  drawSelection({ ctx, runtime, tileSize, selectedTile: state.selectedTile, buildKind: state.buildKind })
}

function drawGrid(args: { ctx: CanvasRenderingContext2D; runtime: GameRuntime; tileSize: number; dpr: number; baseHp: number; baseHpMax: number }) {
  const { ctx, runtime, tileSize, dpr, baseHp, baseHpMax } = args
  const w = GRID_W * tileSize
  const h = GRID_H * tileSize

  ctx.save()
  ctx.translate(0.5, 0.5)

  const rp = getRoadPattern(ctx, dpr)
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const kind = runtime.map.tiles[y]?.[x]
      if (kind === "road") {
        ctx.fillStyle = "rgba(14,16,13,0.82)"
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
        if (rp) {
          ctx.save()
          ctx.globalAlpha = 0.22
          ctx.fillStyle = rp
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
          ctx.restore()
        }
      } else if (kind === "blocked") {
        ctx.fillStyle = "rgba(139,49,40,0.22)"
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
        ctx.save()
        ctx.globalAlpha = 0.6
        ctx.strokeStyle = "rgba(242,229,190,0.32)"
        ctx.lineWidth = Math.max(2, tileSize * 0.05)
        ctx.beginPath()
        ctx.moveTo(x * tileSize + tileSize * 0.22, y * tileSize + tileSize * 0.22)
        ctx.lineTo(x * tileSize + tileSize * 0.78, y * tileSize + tileSize * 0.78)
        ctx.moveTo(x * tileSize + tileSize * 0.78, y * tileSize + tileSize * 0.22)
        ctx.lineTo(x * tileSize + tileSize * 0.22, y * tileSize + tileSize * 0.78)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  ctx.save()
  ctx.strokeStyle = "rgba(0,0,0,0.55)"
  ctx.lineWidth = Math.max(6, tileSize * 0.22)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()
  for (let i = 0; i < runtime.map.path.length; i += 1) {
    const p = runtime.map.path[i]
    const cx = (p.x + 0.5) * tileSize
    const cy = (p.y + 0.5) * tileSize
    if (i === 0) ctx.moveTo(cx, cy)
    else ctx.lineTo(cx, cy)
  }
  ctx.stroke()
  ctx.restore()

  ctx.strokeStyle = "rgba(224,214,176,0.14)"
  ctx.lineWidth = 1
  for (let i = 0; i <= GRID_W; i += 1) {
    ctx.beginPath()
    ctx.moveTo(i * tileSize, 0)
    ctx.lineTo(i * tileSize, h)
    ctx.stroke()
  }

  for (let i = 0; i <= GRID_H; i += 1) {

    ctx.beginPath()
    ctx.moveTo(0, i * tileSize)
    ctx.lineTo(w, i * tileSize)
    ctx.stroke()
  }

  ctx.strokeStyle = "rgba(231,209,136,0.45)"
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, w, h)

  const base = runtime.map.base
  ctx.fillStyle = "rgba(139,49,40,0.45)"
  ctx.fillRect(base.x * tileSize + 2, base.y * tileSize + 2, tileSize - 4, tileSize - 4)

  const flag = getBaseSprite()
  const ready = flag.complete && flag.naturalWidth > 0
  if (ready) {
    const s = tileSize * 0.92
    ctx.globalAlpha = 0.95
    ctx.drawImage(flag, base.x * tileSize + (tileSize - s) / 2, base.y * tileSize + (tileSize - s) / 2, s, s)
  } else {
    ctx.fillStyle = "rgba(242,229,190,0.85)"
    ctx.fillRect(base.x * tileSize + 9, base.y * tileSize + 9, tileSize - 18, tileSize - 18)
  }

  const pct = baseHpMax > 0 ? baseHp / baseHpMax : 0
  const bg = pct > 0.67 ? "rgba(34,197,94,0.95)" : pct > 0.33 ? "rgba(250,204,21,0.95)" : "rgba(220,38,38,0.95)"
  const badgeW = Math.max(26, tileSize * 0.42)
  const badgeH = Math.max(18, tileSize * 0.26)
  const badgeX = base.x * tileSize + tileSize - badgeW - 5
  const badgeY = base.y * tileSize + 5
  ctx.save()
  ctx.fillStyle = bg
  ctx.strokeStyle = "rgba(0,0,0,0.25)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH * 0.35)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = "rgba(0,0,0,0.85)"
  ctx.font = `${Math.round(tileSize * 0.18)}px ui-sans-serif, system-ui`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(String(Math.max(0, Math.round(baseHp))), badgeX + badgeW / 2, badgeY + badgeH / 2 + 0.5)
  ctx.restore()

  ctx.restore()
}

function drawEntities(args: { ctx: CanvasRenderingContext2D; runtime: GameRuntime; tileSize: number; difficulty: Difficulty; levelIndex: number; waveIndex: number }) {
  const { ctx, runtime, tileSize, difficulty, levelIndex, waveIndex } = args

  for (const b of runtime.blasts) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, b.ttl / 0.26)) * 0.85
    ctx.strokeStyle = "rgba(255,198,102,0.85)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  for (const p of runtime.projectiles) {
    if (p.kind === "mortar") {
      const origin = p.origin ?? p.pos
      const impactPos = p.impactPos ?? p.pos
      const ttlMax = p.ttlMax ?? 0.66
      const t = ttlMax > 1e-6 ? Math.max(0, Math.min(1, 1 - p.ttl / ttlMax)) : 1
      const x = origin.x + (impactPos.x - origin.x) * t
      const y = origin.y + (impactPos.y - origin.y) * t
      const h = Math.sin(Math.PI * t) * tileSize * 0.85
      ctx.save()
      ctx.globalAlpha = 0.38
      ctx.fillStyle = "rgba(0,0,0,0.55)"
      ctx.beginPath()
      ctx.arc(x, y, 4.2, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 0.9
      ctx.fillStyle = "rgba(242,229,190,0.92)"
      ctx.beginPath()
      ctx.arc(x, y - h, 3.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(255,206,124,0.55)"
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(x, y - h)
      ctx.lineTo(x, y - Math.max(0, h * 0.6))
      ctx.stroke()
      ctx.restore()
      continue
    }
    const tail = { x: p.pos.x - p.vel.x * 0.02, y: p.pos.y - p.vel.y * 0.02 }
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.strokeStyle = p.kind === "at" ? "rgba(255,206,124,0.85)" : "rgba(242,229,190,0.7)"
    ctx.lineWidth = p.kind === "at" ? 2.4 : 1.2
    ctx.beginPath()
    ctx.moveTo(tail.x, tail.y)
    ctx.lineTo(p.pos.x, p.pos.y)
    ctx.stroke()
    ctx.fillStyle = p.kind === "at" ? "rgba(255,206,124,0.92)" : "rgba(242,229,190,0.85)"
    ctx.beginPath()
    ctx.arc(p.pos.x, p.pos.y, p.kind === "at" ? 3.4 : 1.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  for (const e of runtime.enemies) {
    const spec = getEnemySpec(e.kind, difficulty, levelIndex, waveIndex)
    const hpT = Math.max(0, Math.min(1, e.hp / spec.maxHp))
    const r = e.kind === "boss" ? tileSize * 0.3 : e.kind === "tank" ? tileSize * 0.24 : e.kind === "car" ? tileSize * 0.22 : tileSize * 0.2
    ctx.save()
    ctx.translate(e.pos.x, e.pos.y)

    const sprite = getEnemySprite(e.kind)
    const ready = sprite.complete && sprite.naturalWidth > 0
    if (ready) {
      ctx.globalAlpha = 0.95
      ctx.drawImage(sprite, -r, -r, r * 2, r * 2)
    } else {
      ctx.fillStyle =
        e.kind === "boss"
          ? "rgba(58,64,54,0.95)"
          : e.kind === "tank"
            ? "rgba(76,92,66,0.95)"
            : e.kind === "car"
              ? "rgba(98,109,72,0.95)"
              : "rgba(118,128,86,0.95)"
      ctx.strokeStyle = "rgba(20,20,16,0.65)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(-r, -r, r * 2, r * 2, r * 0.35)
      ctx.fill()
      ctx.stroke()
    }

    ctx.fillStyle = "rgba(0,0,0,0.35)"
    ctx.fillRect(-r, r + 6, r * 2, e.kind === "boss" ? 6 : 5)
    ctx.fillStyle = "rgba(229,219,176,0.85)"
    ctx.fillRect(-r, r + 6, r * 2 * hpT, e.kind === "boss" ? 6 : 5)

    ctx.restore()
  }

  for (const t of runtime.towers) {
    const stats = getTowerStats(t.kind, t.level)
    const cx = (t.tile.x + 0.5) * tileSize
    const cy = (t.tile.y + 0.5) * tileSize
    const r = tileSize * 0.28
    ctx.save()
    ctx.translate(cx, cy)
    ctx.fillStyle = "rgba(24,26,19,0.68)"
    ctx.beginPath()
    ctx.arc(0, 0, r * 1.06, 0, Math.PI * 2)
    ctx.fill()

    const sprite = getTowerSprite(t.kind)
    const ready = sprite.complete && sprite.naturalWidth > 0
    if (ready) {
      ctx.globalAlpha = 0.95
      ctx.drawImage(sprite, -r, -r, r * 2, r * 2)
    } else {
      ctx.fillStyle = t.kind === "mg" ? "rgba(186,170,118,0.95)" : t.kind === "at" ? "rgba(202,184,132,0.95)" : "rgba(197,176,118,0.95)"
      ctx.strokeStyle = "rgba(20,18,12,0.75)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    if (t.level > 0) {
      ctx.fillStyle = "rgba(139,49,40,0.9)"
      ctx.beginPath()
      ctx.arc(r * 0.82, -r * 0.82, r * 0.33, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = "rgba(242,229,190,0.9)"
      ctx.font = `${Math.round(tileSize * 0.18)}px ui-sans-serif, system-ui`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(String(t.level), r * 0.82, -r * 0.82)
    }

    ctx.restore()

    const ring = stats.rangeTiles * tileSize
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.strokeStyle = "rgba(242,229,190,0.8)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, ring, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

function drawSelection(args: {
  ctx: CanvasRenderingContext2D
  runtime: GameRuntime
  tileSize: number
  selectedTile: TilePos | null
  buildKind: TowerKind | null
}) {
  const { ctx, runtime, tileSize, selectedTile, buildKind } = args
  if (buildKind) {
    ctx.save()
    ctx.globalAlpha = 0.16
    ctx.fillStyle = "rgba(242,229,190,1)"
    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        const kind = runtime.map.tiles[y]?.[x]
        if (kind !== "buildable") continue
        const occupied = runtime.towers.some((t) => t.tile.x === x && t.tile.y === y)
        if (occupied) continue
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }
    ctx.restore()
  }

  if (!selectedTile) return
  ctx.save()
  ctx.strokeStyle = "rgba(255,206,124,0.92)"
  ctx.lineWidth = 3
  ctx.strokeRect(selectedTile.x * tileSize + 2, selectedTile.y * tileSize + 2, tileSize - 4, tileSize - 4)
  ctx.restore()
}
