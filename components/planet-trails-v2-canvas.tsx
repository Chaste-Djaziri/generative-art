"use client"

import { useEffect, useRef } from "react"

export function PlanetTrailsV2Canvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    // Dynamically import p5 to avoid SSR issues
    import("p5").then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: any) => {
        const seed = Math.random() * 9999
        const num = 4
        let radius: number, mySize: number
        let v_planet: any[] = []
        let trails: any[] = []
        let t = 0
        let colors: any[] = []
        let colorbg: any

        // Brown/chocolate color schemes
        const colorScheme = [
          {
            name: "dark chocolate",
            colors: ["#3C2414", "#4A2C17", "#5D3A1F", "#6B4423", "#7D4E2E"],
          },
          {
            name: "milk chocolate",
            colors: ["#8B5F3C", "#9D6B47", "#A67C52", "#B88A5C", "#C49B6D"],
          },
          {
            name: "caramel",
            colors: ["#B87333", "#C5843D", "#D1954F", "#DEA664", "#E0B380"],
          },
          {
            name: "champagne",
            colors: ["#D4A574", "#E0B380", "#E8C19A", "#F0D4A8", "#F5E1C0"],
          },
          {
            name: "cocoa",
            colors: ["#5D3A1F", "#6B4423", "#7D4E2E", "#8B5F3C", "#9D6B47"],
          },
          {
            name: "espresso",
            colors: ["#3C2414", "#4A2C17", "#5D3A1F", "#6B4423", "#7D4E2E"],
          },
          {
            name: "hazelnut",
            colors: ["#A67C52", "#B88A5C", "#C49B6D", "#D4A574", "#E0B380"],
          },
          {
            name: "mocha",
            colors: ["#4A2C17", "#5D3A1F", "#6B4423", "#7D4E2E", "#8B5F3C"],
          },
          {
            name: "toffee",
            colors: ["#B87333", "#C5843D", "#D1954F", "#DEA664", "#E8C19A"],
          },
          {
            name: "coffee",
            colors: ["#2A1810", "#3C2414", "#4A2C17", "#5D3A1F", "#6B4423"],
          },
        ]

        const bgcolor = "2A1810-1A0F08-3D2415-2F1B0F".split("-").map((a) => "#" + a)

        const noiseJitterVec = (v: any, scale = 0, frame = 0): any => {
          p.randomSeed(seed)

          const n1 = p.noise(v.x * 0.01, v.y * 0.01, frame * 0.02)
          const n2 = p.noise(v.y * 0.01, v.z * 0.01, frame * 0.02)
          const n3 = p.noise(v.z * 0.01, v.x * 0.01, frame * 0.02)

          const jx = v.x + p.map(n1, 0, 1, -scale, scale)
          const jy = v.y + p.map(n2, 0, 1, -scale, scale)
          const jz = v.z + p.map(n3, 0, 1, -scale, scale)
          return p.createVector(jx, jy, jz)
        }

        p.setup = () => {
          p.randomSeed(seed)
          p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL)
          p.angleMode(p.RADIANS)
          mySize = p.min(p.windowWidth, p.windowHeight)
          radius = mySize * 0.35

          const selectedScheme = p.random(colorScheme)
          colors = selectedScheme.colors.map((c: string) => p.color(c))

          const bg = p.random(bgcolor)
          colorbg = p.color(bg)
          p.background(colorbg)

          for (let i = 0; i < num; i++) {
            trails.push([])
          }

          // Initialize v_planet array
          v_planet = []
        }

        p.draw = () => {
          p.randomSeed(seed)
          p.background(colorbg)

          p.translate(0, 0, mySize / 2)

          const layerCount = 2
          const R = radius * 0.25

          p.rotateX(p.random(p.TAU) + p.frameCount / 100)
          p.rotateY(p.random(p.TAU) + p.frameCount / 100)
          p.rotateZ(p.random(p.TAU) + p.frameCount / 100)

          // Update planet trajectories
          for (let i = 0; i < num; i++) {
            const layer = i % layerCount
            const layerAngleOffset = (p.TWO_PI / layerCount) * layer
            const baseAngle = (p.TWO_PI / num) * i + t * 2.5

            const spiralRadius = R * (0.4 + 0.5 * p.sin(t + i))
            const heightOffset = p.sin(t * 1.7 + i) * radius * 0.5

            const theta = baseAngle + layerAngleOffset
            const phi = t + i * 0.1

            const x = spiralRadius * p.sin(theta) * p.cos(phi)
            const y = spiralRadius * p.sin(theta) * p.sin(phi)
            const z = spiralRadius * p.cos(theta) + heightOffset

            const planet = p.createVector(x, y, z)
            v_planet[i] = planet
            trails[i].push(planet.copy())

            if (trails[i].length > 200) {
              trails[i].shift()
            }
          }

          // Draw trails
          for (let i = 0; i < num; i++) {
            p.randomSeed(seed)

            p.push()
            p.rotateX(p.random(p.TAU) + p.frameCount / 100)
            p.rotateY(p.random(p.TAU) + p.frameCount / 100)
            p.rotateZ(p.random(p.TAU) + p.frameCount / 100)

            for (let j = 1; j < trails[i].length; j++) {
              p.rotateX(j / 4000)
              p.rotateY(j / 4000)
              p.rotateZ(j / 4000)

              const p1 = trails[i][j - 1]
              const p2 = trails[i][j]
              const progress = j / trails[i].length

              if (progress > 0.95 && p.random() < 0.85) continue // Simulate dry brush effect

              const baseSW = p.sin(progress * p.PI) * (i + 1) * p.random(1, 30)

              // Color
              const c = p.color(colors[i % colors.length])
              const alpha = p.map(progress, 0, 1, 255, 255)
              c.setAlpha(alpha)

              // Jittered trail
              const p1_main = noiseJitterVec(p1, 2, p.frameCount / 1)
              const p2_main = noiseJitterVec(p2, 6, p.frameCount / 1)

              // Adjust line width based on velocity
              const vel = p5.Vector.sub(p2_main, p1_main).mag()
              const dynamicSW = baseSW * p.map(vel, 0, 1, 0.1, 1.0)

              // Main line
              p.noStroke()
              p.fill(c)

              p.push()
              p.translate(p1_main.x, p1_main.y, p1_main.z)
              p.sphere(dynamicSW / 100)
              p.pop()

              p.push()
              p.translate(p2_main.x, p2_main.y, p2_main.z)
              p.sphere(dynamicSW / p.random(10, 50))
              p.pop()

              // Fade trail (subtle)
              const c3 = p.color(c)
              c3.setAlpha(alpha * 0.999)
              p.stroke(c3)
              p.strokeWeight(dynamicSW * 0.05)

              const offset = p5.Vector.random3D().mult(1)
              const p1_fade = p1_main.copy().add(offset)
              const p2_fade = p2_main.copy().add(offset)
            }
            p.pop()
          }

          // Draw planet spheres
          for (let i = 0; i < num; i++) {
            p.randomSeed(seed)

            p.push()
            p.rotateX(-p.random(p.TAU) + p.frameCount / 100)
            p.rotateY(-p.random(p.TAU) + p.frameCount / 100)
            p.rotateZ(-p.random(p.TAU) + p.frameCount / 100)

            const c = p.color(colors[i % colors.length])
            c.setAlpha(255)
            p.fill(c)
            p.noStroke()
            p.translate(v_planet[i].x, v_planet[i].y, v_planet[i].z)
            p.sphere((i + 1) * 2)
            p.pop()
          }

          t += 0.1 / 10
        }

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight)
          mySize = p.min(p.windowWidth, p.windowHeight)
          radius = mySize * 0.35
        }
      }

      if (containerRef.current) {
        sketchRef.current = new p5(sketch, containerRef.current)
      }
    })

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove()
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
