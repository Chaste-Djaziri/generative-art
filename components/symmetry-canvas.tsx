"use client"

import { useEffect, useRef } from "react"

export function SymmetryCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    // Dynamically import p5 to avoid SSR issues
    import("p5").then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: any) => {
        let seed: number
        let mySize: number, margin: number
        let num: number
        let myGraphic: any
        let palette: any[]
        let str_wei: number
        let unit_x: number, unit_y: number
        let count: number
        let t: number
        let mods: any[] = []
        let a: number, b: number, c: number
        let rez: number, n: number

        // Color schemes
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

        p.setup = () => {
          a = p.TAU / p.TAU
          b = a + a
          c = a - a

          seed = Math.random() * p.sq(p.sq(p.sq(p.int(p.TAU))))
          p.randomSeed(seed)

          // Use full window dimensions for canvas
          p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL)
          p.perspective(0.5, p.width / p.height, 5, 10000)

          // Use min dimension for geometric scaling calculations
          mySize = p.min(p.windowWidth, p.windowHeight)

          palette = p.random(colorScheme).colors.concat()
          p.background(p.random(bgcolor))

          p.frameRate(50)
          t = rez = c
          n = c
        }

        p.draw = () => {
          p.randomSeed(seed)
          p.background(p.random(bgcolor))

          p.push()
          p.translate(0, 0, -mySize * 4.0)
          p.rotateX(p.random(p.TAU))
          p.rotateY(p.random(p.TAU))
          p.rotateZ(p.random(p.TAU))

          switch (p.random([1, 2, 3])) {
            case 1:
              p.rotateX(p.random([-1, 1]) * p.frameCount / 100)
              break
            case 2:
              p.rotateY(p.random([-1, 1]) * p.frameCount / 100)
              break
            case 3:
              p.rotateZ(p.random([-1, 1]) * p.frameCount / 100)
              break
          }

          const cubeSize = mySize / (a + a / b) / 2.0
          const plus = cubeSize / 5

          for (let i = -cubeSize / b; i < cubeSize / b + plus; i += plus * a) {
            for (let j = -cubeSize / b; j < cubeSize / b + plus; j += plus * a) {
              for (let k = -cubeSize / b; k < cubeSize / b + plus; k += plus * a) {
                p.strokeCap(p.PROJECT)
                n = p.noise(i * rez + t, j * rez + t, k * rez + t) * p.random(1, 10)

                p.push()
                p.translate(i * n, j * n, k * n)
                p.rotateX(
                  (p.TAU / (b * b)) *
                    p.random([-a, a, b, -b]) *
                    p.random([a, b, a + b, b * b])
                )
                p.rotateY(
                  (p.TAU / (b * b)) *
                    p.random([-a, a, b, -b]) *
                    p.random([a, b, a + b, b * b])
                )
                p.rotateZ(
                  (p.TAU / (b * b)) *
                    p.random([-a, a, b, -b]) *
                    p.random([a, b, a + b, b * b])
                )

                const planeSize = mySize / p.random([4, 16, 32, 64])

                p.push()
                p.translate(i, j, k)

                switch (p.random([1, 1, 2])) {
                  case 1:
                    p.noStroke()
                    p.fill(p.random(palette))
                    p.plane(planeSize)
                    break
                  case 2:
                    p.noFill()
                    p.stroke(p.random(palette))
                    p.strokeWeight(p.random(1, 2))
                    p.line(-planeSize / 2, -planeSize / 2, planeSize / 2, -planeSize / 2)
                    p.line(planeSize / 2, -planeSize / 2, planeSize / 2, planeSize / 2)
                    p.line(planeSize / 2, planeSize / 2, -planeSize / 2, planeSize / 2)
                    p.line(-planeSize / 2, planeSize / 2, -planeSize / 2, -planeSize / 2)
                    break
                }

                p.pop()

                const px = plus / p.random(a, p.int(p.TAU)) / b / p.sin(n)
                const py = plus / p.random(a, p.int(p.TAU)) / b / p.cos(n)
                const pz = plus / p.random(a, p.int(p.TAU)) / b / p.tan(n)

                p.push()
                p.noStroke()
                p.fill(p.random(palette))
                p.translate(px, py, pz)
                p.rotateX(p.random([-1, 1]) * p.frameCount / 100)
                p.rotateY(p.random([-1, 1]) * p.frameCount / 100)
                p.rotateZ(p.random([-1, 1]) * p.frameCount / 100)
                p.pop()

                p.noFill()
                p.stroke(p.random(palette))
                p.strokeWeight((p.random(a, b) * 2) / p.random(1, 100))
                p.line(0, 0, 0, px, py, pz)

                p.pop()
              }
            }
          }

          p.pop()

          t += 0.1 / 10
        }

        p.windowResized = () => {
          // Resize canvas to full window dimensions
          p.resizeCanvas(p.windowWidth, p.windowHeight)
          // Update mySize for geometric scaling calculations
          mySize = p.min(p.windowWidth, p.windowHeight)
        }

        // Handle key press for saving (optional - can be removed if not needed)
        p.keyTyped = () => {
          if (p.key === "s" || p.key === "S") {
            p.saveCanvas("genuary-20250126", "png")
          }
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
