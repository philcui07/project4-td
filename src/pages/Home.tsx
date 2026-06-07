import GameScreen from "@/components/GameScreen"
import LevelClearScreen from "@/components/LevelClearScreen"
import MobileLandscape from "@/components/MobileLandscape"
import MenuScreen from "@/components/MenuScreen"
import ReportScreen from "@/components/ReportScreen"
import { useGameStore } from "@/store/gameStore"

export default function Home() {
  const phase = useGameStore((s) => s.phase)
  return (
    <MobileLandscape>
      <div className="min-h-screen bg-app text-[color:var(--paper)]">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-appTexture" />
        {phase === "menu" ? (
          <MenuScreen />
        ) : phase === "playing" ? (
          <GameScreen />
        ) : phase === "level_clear" ? (
          <LevelClearScreen />
        ) : (
          <ReportScreen />
        )}
      </div>
    </MobileLandscape>
  )
}
