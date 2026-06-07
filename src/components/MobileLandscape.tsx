import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"

function detectMobile() {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  if (/(Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini)/i.test(ua)) return true
  if (navigator.maxTouchPoints >= 2 && /Macintosh/i.test(ua)) return true
  return false
}

function detectPortrait() {
  if (typeof window === "undefined") return false
  if (window.matchMedia) return window.matchMedia("(orientation: portrait)").matches
  return window.innerHeight > window.innerWidth
}

export default function MobileLandscape({ children }: { children: ReactNode }) {
  const isMobile = useMemo(() => detectMobile(), [])
  const [isPortrait, setIsPortrait] = useState(() => detectPortrait())
  const rotate = isMobile && isPortrait

  useEffect(() => {
    if (!isMobile) return
    const onChange = () => setIsPortrait(detectPortrait())
    window.addEventListener("resize", onChange)
    window.addEventListener("orientationchange", onChange)
    return () => {
      window.removeEventListener("resize", onChange)
      window.removeEventListener("orientationchange", onChange)
    }
  }, [isMobile])

  useEffect(() => {
    if (!rotate) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [rotate])

  if (!rotate) return <>{children}</>

  return (
    <div className="fixed inset-0 bg-[#0b0e0a]">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vh",
          height: "100vw",
          transform: "rotate(90deg) translateY(-100%)",
          transformOrigin: "top left",
        }}
      >
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  )
}

