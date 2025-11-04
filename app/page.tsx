import { ParticleCanvas } from "@/components/particle-canvas"
import { RailwayCanvas } from "@/components/railway-canvas"
import { SymmetryCanvas } from "@/components/symmetry-canvas"
import { CellularGrowthCanvas } from "@/components/cellular-growth-canvas"
import { PlanetTrailsV2Canvas } from "@/components/planet-trails-v2-canvas"
import { BlackWhiteGeometricCanvas } from "@/components/black-white-geometric-canvas"
import { VoronoiIllumCanvas } from "@/components/voronoi-illum-canvas"

export default function Home() {
  return (
    <main className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950">
      <VoronoiIllumCanvas />
    </main>
  )
}
