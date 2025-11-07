"use client"

import { useEffect, useState } from "react"
import { ParticleCanvas } from "@/components/particle-canvas"
import { RailwayCanvas } from "@/components/railway-canvas"
import { SymmetryCanvas } from "@/components/symmetry-canvas"
import { CellularGrowthCanvas } from "@/components/cellular-growth-canvas"
import { PlanetTrailsV2Canvas } from "@/components/planet-trails-v2-canvas"
import { BlackWhiteGeometricCanvas } from "@/components/black-white-geometric-canvas"
import { VoronoiIllumCanvas } from "@/components/voronoi-illum-canvas"
import { WelcomeOverlay } from "@/components/welcome-overlay"

const CANVAS_COMPONENTS = [
  { id: "particle", component: ParticleCanvas },
  { id: "railway", component: RailwayCanvas },
  { id: "symmetry", component: SymmetryCanvas },
  { id: "cellular", component: CellularGrowthCanvas },
  { id: "planet", component: PlanetTrailsV2Canvas },
  { id: "geometric", component: BlackWhiteGeometricCanvas },
  { id: "voronoi", component: VoronoiIllumCanvas },
]

const TRANSITION_DURATION = 2000 // 2 seconds fade transition
const DISPLAY_DURATION = 20000 // 20 seconds per canvas - longer viewing time

export function CanvasCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CANVAS_COMPONENTS.length)
    }, DISPLAY_DURATION)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950">
      {CANVAS_COMPONENTS.map((canvas, index) => {
        const Component = canvas.component
        const isActive = index === currentIndex
        const isNext = index === (currentIndex + 1) % CANVAS_COMPONENTS.length
        
        // Render active canvas and next canvas for smooth crossfade
        const shouldRender = isActive || isNext
        const opacity = isActive ? 1 : 0

        if (!shouldRender) return null

        return (
          <div
            key={canvas.id}
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{
              opacity,
              transitionDuration: `${TRANSITION_DURATION}ms`,
              pointerEvents: isActive ? "auto" : "none",
              zIndex: isActive ? 2 : 1,
            }}
          >
            <Component />
          </div>
        )
      })}
      <WelcomeOverlay />
    </div>
  )
}
