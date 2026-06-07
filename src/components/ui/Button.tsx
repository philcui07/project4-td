import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes } from "react"

type Variant = "primary" | "ghost" | "danger"

export default function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50"
  const v =
    variant === "primary"
      ? "bg-[color:var(--brass)] text-black shadow-[0_6px_0_rgba(0,0,0,0.35)] hover:brightness-[1.05]"
      : variant === "danger"
        ? "bg-[color:var(--red)] text-[color:var(--paper)] shadow-[0_6px_0_rgba(0,0,0,0.35)] hover:brightness-[1.06]"
        : "bg-black/20 text-[color:var(--paper)] ring-1 ring-[color:var(--line)] hover:bg-black/30"
  return <button className={cn(base, v, className)} {...props} />
}

