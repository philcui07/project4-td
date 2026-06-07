export function uid(prefix: string) {
  const g = globalThis as unknown as { crypto?: Crypto }
  const id =
    typeof g.crypto?.randomUUID === "function"
      ? g.crypto.randomUUID()
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
  return `${prefix}_${id}`
}

