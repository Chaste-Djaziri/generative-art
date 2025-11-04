"use client"

import { useEffect, useRef } from "react"

export function RailwayCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    // Dynamically import p5 to avoid SSR issues
    import("p5").then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: any) => {
        let poles: any[] = []
        let wires: any[] = []
        const polesNum = 200
        const polesHeight = 60
        const radius = 300
        const viewAngle = -0.5

        // Color variables (will be initialized in setup)
        let trackColor: any
        let sleeperColor: any
        let poleColor: any
        let wireColor: any
        let bgColor: any

        p.setup = () => {
          // Brown/chocolate color palette - initialize after p5 is ready
          trackColor = p.color(60, 36, 20) // Dark brown #3C2414
          sleeperColor = p.color(139, 90, 43) // Medium brown #8B5A3C
          poleColor = p.color(75, 45, 25) // Dark brown #4B2D19
          wireColor = p.color(107, 67, 35) // Medium-dark brown #6B4323
          bgColor = p.color(245, 225, 192) // Light cream/champagne #F5E1C0

          p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL)

          poles = Array(polesNum)
            .fill(null)
            .map(() => {
              const r = p.random(p.TWO_PI)
              const d =
                p.random(2) < 1
                  ? p.random(radius * 0.7, radius * 0.9)
                  : p.random(radius * 1.1, radius * 1.2)
              const pos = p.createVector(p.cos(r) * d, p.sin(r) * d)
              return pos
            })

          for (let i = polesNum; i--; ) {
            const current = poles[i]
            for (let j = i; j--; ) {
              const other = poles[j]
              const delta = p5.Vector.sub(other, current)
              const dst = delta.mag()

              if (
                !poles.some(
                  (any: any) =>
                    dst > p.dist(any.x, any.y, current.x, current.y) &&
                    dst > p.dist(any.x, any.y, other.x, other.y)
                )
              ) {
                const pos = p5.Vector.add(current, other)
                pos.div(2)
                const length = p.dist(current.x, current.y, other.x, other.y)
                const angle = p.atan2(other.y - current.y, other.x - current.x)
                wires.push({ pos, length, angle })
              }
            }
          }
        }

        p.draw = () => {
          p.background(bgColor)

          // Railway track - brown/chocolate
          p.noFill()
          p.stroke(trackColor)
          p.strokeWeight(2)
          p.torus(radius * 1.05, 1)
          p.torus(radius * 0.95, 1)

          // Railway sleepers - medium brown
          p.fill(sleeperColor)
          p.stroke(poleColor)
          p.strokeWeight(1)
          for (let r = 0; r < p.TWO_PI; r += 0.06) {
            p.push()
            p.rotateZ(r)
            p.translate(radius * 0.995, 0, 0)
            p.box(radius * 0.15, 5, 2)
            p.pop()
          }

          // Poles - dark brown
          p.fill(poleColor)
          p.stroke(trackColor)
          p.strokeWeight(1)
          for (const pole of poles) {
            p.push()
            p.translate(pole.x, pole.y, polesHeight / 2)
            p.box(2, 2, polesHeight)
            p.pop()
          }

          // Wires - medium-dark brown
          p.fill(wireColor)
          p.noStroke()
          for (const wire of wires) {
            p.push()
            p.translate(wire.pos.x, wire.pos.y)
            p.translate(0, 0, polesHeight * 0.95)
            p.rotate(wire.angle)
            p.box(wire.length, 1, 1)
            p.pop()
          }

          // Camera setting
          const t = p.frameCount / 150
          p.camera(
            p.cos(t) * radius,
            p.sin(t) * radius,
            radius / 3,
            p.cos(t + viewAngle) * radius,
            p.sin(t + viewAngle) * radius,
            0,
            0,
            0,
            -1
          )
        }

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight)
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
