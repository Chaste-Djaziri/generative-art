"use client"

import { useEffect, useRef } from "react"

interface Cell {
  alive: boolean
  age: number
}

export function CellularGrowthCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    // Dynamically import p5 to avoid SSR issues
    import("p5").then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: any) => {
        let cols: number, rows: number
        let grid: Cell[][]
        let cellSize = 20
        const shapes = ["circle", "triangle", "rect"]
        let shapeMap: string[][]
        const growthThreshold = 2
        const maxAge = 100
        let mySize: number
        const seed = Math.random() * 999999
        let colors: any[] = []
        let colorbg: any

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

        const bgcolor = "2A1810-1A0F08-3D2415-2F1B0F-3C2414".split("-").map((a) => "#" + a)

        function make2DArray(cols: number, rows: number): Cell[][] {
          const arr: Cell[][] = new Array(cols)
          for (let i = 0; i < cols; i++) {
            arr[i] = new Array(rows)
          }
          return arr
        }

        function make2DArrayString(cols: number, rows: number): string[][] {
          const arr: string[][] = new Array(cols)
          for (let i = 0; i < cols; i++) {
            arr[i] = new Array(rows)
          }
          return arr
        }

        p.setup = () => {
          p.randomSeed(seed)
          p.createCanvas(p.windowWidth, p.windowHeight)

          cols = p.floor(p.width / cellSize)
          rows = p.floor(p.height / cellSize)

          grid = make2DArray(cols, rows)
          shapeMap = make2DArrayString(cols, rows)

          // Initialize sparse "seed cells"
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              grid[i][j] = {
                alive: p.random() < 0.02, // Few initial living cells
                age: 0,
              }
              shapeMap[i][j] = p.random(shapes)
            }
          }

          p.noStroke()

          const selectedScheme = p.random(colorScheme)
          colors = selectedScheme.colors.map((c: string) => p.color(c))

          const bg = p.random(bgcolor)
          colorbg = p.color(bg)
          p.background(colorbg)
        }

        function countAliveNeighbors(x: number, y: number): number {
          let total = 0
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const col = (x + i + cols) % cols
              const row = (y + j + rows) % rows
              if ((i !== 0 || j !== 0) && grid[col][row].alive) {
                total++
              }
            }
          }
          return total
        }

        function naturalGrowthUpdate() {
          const newGrid = make2DArray(cols, rows)

          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              const cell = grid[i][j]
              const neighbors = countAliveNeighbors(i, j)
              const newCell: Cell = {
                ...cell,
              }

              if (!cell.alive && neighbors >= growthThreshold && p.random() < 0.1) {
                newCell.alive = true
                newCell.age = 0
              } else if (cell.alive) {
                newCell.alive = true
                newCell.age = cell.age
              }

              newGrid[i][j] = newCell
            }
          }

          grid = newGrid
        }

        p.draw = () => {
          // Background with transparency for trail effect
          const r = p.red(colorbg)
          const g = p.green(colorbg)
          const b = p.blue(colorbg)
          p.background(r, g, b, 51) // 51 = 0x33 in decimal (about 20% opacity)

          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              const cell = grid[i][j]

              if (cell.alive) {
                cell.age++

                const x = i * cellSize
                const y = j * cellSize
                const c = p.color(p.random(colors))
                c.setAlpha(p.map(cell.age, 0, maxAge, 20, 100))

                p.fill(c)

                p.push()
                p.translate(x + cellSize / 2, y + cellSize / 2)

                const s = cellSize * p.map(cell.age, 0, maxAge, 0.2, 1)

                switch (shapeMap[i][j]) {
                  case "circle":
                    p.ellipse(0, 0, s)
                    break
                  case "rect":
                    p.rectMode(p.CENTER)
                    p.rect(0, 0, s, s)
                    break
                  case "triangle":
                    const h = s * p.sqrt(3) / 2
                    p.triangle(0, -h / 2, -s / 2, h / 2, s / 2, h / 2)
                    break
                }

                p.pop()

                if (cell.age > maxAge) {
                  cell.alive = false // Death
                }
              }
            }
          }

          naturalGrowthUpdate()
        }

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight)
          cols = p.floor(p.width / cellSize)
          rows = p.floor(p.height / cellSize)

          // Reinitialize grid when resized
          grid = make2DArray(cols, rows)
          shapeMap = make2DArrayString(cols, rows)

          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              grid[i][j] = {
                alive: p.random() < 0.02,
                age: 0,
              }
              shapeMap[i][j] = p.random(shapes)
            }
          }
        }
      }

      sketchRef.current = new p5(sketch, containerRef.current)
    })

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove()
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
