import type { EnemyKind, TowerKind } from "@/game/types"

type EnemySpriteKey = `enemy:${EnemyKind}`
type TowerSpriteKey = `tower:${TowerKind}`
type BaseSpriteKey = "base:allies"

type SpriteKey = EnemySpriteKey | TowerSpriteKey | BaseSpriteKey

const spriteUrl: Record<SpriteKey, string> = {
  "enemy:infantry": new URL("../assets/sprites/enemy_infantry.svg", import.meta.url).toString(),
  "enemy:car": new URL("../assets/sprites/enemy_car.svg", import.meta.url).toString(),
  "enemy:tank": new URL("../assets/sprites/enemy_tank.svg", import.meta.url).toString(),
  "enemy:boss": new URL("../assets/sprites/enemy_boss.svg", import.meta.url).toString(),
  "tower:mg": new URL("../assets/sprites/tower_mg.svg", import.meta.url).toString(),
  "tower:at": new URL("../assets/sprites/tower_at.svg", import.meta.url).toString(),
  "tower:mortar": new URL("../assets/sprites/tower_mortar.svg", import.meta.url).toString(),
  "base:allies": new URL("../assets/sprites/base_allies.svg", import.meta.url).toString(),
}

const cache = new Map<string, HTMLImageElement>()

function getImage(url: string) {
  const exist = cache.get(url)
  if (exist) return exist
  const img = new Image()
  img.decoding = "async"
  img.src = url
  cache.set(url, img)
  return img
}

export function getEnemySprite(kind: EnemyKind) {
  return getImage(spriteUrl[`enemy:${kind}`])
}

export function getTowerSprite(kind: TowerKind) {
  return getImage(spriteUrl[`tower:${kind}`])
}

export function getBaseSprite() {
  return getImage(spriteUrl["base:allies"])
}
