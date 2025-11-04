"use client"

import { useEffect, useRef } from "react"

export function BlackWhiteGeometricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    // Dynamically import p5 to avoid SSR issues
    import("p5").then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: any) => {
        const seed = Math.random() * 9999
        let mySize: number, margin: number
        let num: number
        let myGraphic: any
        let frontGraphic: any
        let palette: any[] = []
        let layers: any[] = []
        const speed = 3
        let layer_num: number, layer_w: number, layer_h: number
        let offset = 0

        // Brown/chocolate color scheme
        const colorScheme = [
          {
            name: "chocolate",
            colors: ["#3C2414", "#8B5F3C", "#D4A574", "#E8C19A", "#F5E1C0"],
          },
        ]

        // Easing class
        class Easing {
          static easeInSine(x: number) {
            return 1 - Math.cos((x * Math.PI) / 2)
          }
          static easeOutSine(x: number) {
            return Math.sin((x * Math.PI) / 2)
          }
          static easeInOutSine(x: number) {
            return -(Math.cos(Math.PI * x) - 1) / 2
          }
          static easeInQuad(x: number) {
            return x * x
          }
          static easeOutQuad(x: number) {
            return 1 - (1 - x) * (1 - x)
          }
          static easeInOutQuad(x: number) {
            return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
          }
          static easeInCubic(x: number) {
            return x * x * x
          }
          static easeOutCubic(x: number) {
            return 1 - Math.pow(1 - x, 3)
          }
          static easeInOutCubic(x: number) {
            return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
          }
          static easeInQuart(x: number) {
            return x * x * x * x
          }
          static easeOutQuart(x: number) {
            return 1 - Math.pow(1 - x, 4)
          }
          static easeInOutQuart(x: number) {
            return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
          }
          static easeInQuint(x: number) {
            return x * x * x * x * x
          }
          static easeOutQuint(x: number) {
            return 1 - Math.pow(1 - x, 5)
          }
          static easeInOutQuint(x: number) {
            return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
          }
          static easeInExpo(x: number) {
            return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
          }
          static easeOutExpo(x: number) {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
          }
          static easeInOutExpo(x: number) {
            return x === 0
              ? 0
              : x === 1
              ? 1
              : x < 0.5
              ? Math.pow(2, 20 * x - 10) / 2
              : (2 - Math.pow(2, -20 * x + 10)) / 2
          }
          static easeInCirc(x: number) {
            return 1 - Math.sqrt(1 - Math.pow(x, 2))
          }
          static easeOutCirc(x: number) {
            return Math.sqrt(1 - Math.pow(x - 1, 2))
          }
          static easeInOutCirc(x: number) {
            return x < 0.5
              ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
              : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
          }
          static easeInBack(x: number) {
            const c1 = 1.70158
            const c3 = c1 + 1
            return c3 * x * x * x - c1 * x * x
          }
          static easeOutBack(x: number) {
            const c1 = 1.70158
            const c3 = c1 + 1
            return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
          }
          static easeInOutBack(x: number) {
            const c1 = 1.70158
            const c2 = c1 * 1.525
            return x < 0.5
              ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
              : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
          }
        }

        // makeLayer class
        class makeLayer {
          x: number
          y: number
          size: number
          rotate: number
          tog: number
          t: number
          t1: number
          speed: number

          constructor(x: number, y: number, size: number, rotate: number) {
            this.x = x
            this.y = y
            this.size = size
            this.rotate = rotate
            this.settime()
            this.tog = 0
            this.t = 0
            this.t1 = 0
            this.speed = p.int(p.random(1, 6))
          }

          display() {
            p.noStroke()
            p.texture(myGraphic)
            p.push()
            p.rotateX((p.frameCount / 5) * p.random([-1, 1]))
            p.rotateY((p.frameCount / 5) * p.random([-1, 1]))
            p.rotateZ((p.frameCount / 5) * p.random([-1, 1]))
            p.translate(-p.width * 0.5 + this.size / 2 + this.x, -p.height * 0.5 + this.size / 2 + this.y, 0)

            const lavaShape = p.int(p.random(3, 6))
            const torusD = this.size * 0.35
            const lavaLight_n = p.int(p.random(12, 4))

            p.sphere(torusD / p.random(10, 50))

            for (let i = 0; i < lavaLight_n; i++) {
              const lavaLight_s = this.size / p.random(12, 6)
              p.rotateX(p.random(p.TAU) + offset / 10)
              p.rotateY(p.random(p.TAU) + offset / 10)
              p.rotateZ(p.random(p.TAU) + offset / 10)
              this.updateRotate()

              p.push()
              p.translate(0, 0, (i * lavaLight_s) / lavaLight_n)
              p.box((torusD / lavaLight_n) * (lavaLight_n - i) * 2, 2, 2)
              p.torus((torusD / lavaLight_n) * (lavaLight_n - i), lavaLight_s / lavaLight_n, 60, lavaShape)
              p.pop()
            }
            p.pop()

            for (let i = 0; i < 20; i++) {
              p.push()
              p.rotateX((p.frameCount / 5) * p.random([-1, 1]))
              p.rotateY((p.frameCount / 5) * p.random([-1, 1]))
              p.rotateZ((p.frameCount / 5) * p.random([-1, 1]))
              p.translate(
                p.random(-1, 1) * (mySize / 2),
                p.random(-1, 1) * (mySize / 2),
                p.random(-1, 1) * (mySize / 2)
              )
              p.rotateX(p.random(p.TAU))
              p.rotateY(p.random(p.TAU))
              p.rotateZ(p.random(p.TAU))
              p.sphere(p.random(1, 5))
              p.pop()
            }
          }

          settime() {
            this.t = -p.int(p.map(speed, 1, 5, 100, 500))
            this.t1 = p.map(speed, 1, 5, 500, 100)
          }

          updateRotate() {
            switch (p.int(p.random(6))) {
              case 0:
                p.rotateZ(-this.rotate / p.random([1, 0.5]))
                break
              case 1:
                p.rotateZ(this.rotate / p.random([1, 0.5]))
                break
              case 2:
                p.rotateZ(this.rotate)
                break
              case 3:
                p.rotateZ(-this.rotate)
                break
              case 4:
                p.rotateZ(this.rotate)
                break
              case 5:
                p.rotateZ(this.rotate)
                break
            }
          }

          update1() {
            if (this.t >= 0 && this.t < this.t1) {
              const easePar = p.norm(this.t, 0, this.t1 - 1)
              this.rotate = p.lerp(-90, 90, Easing.easeOutQuint(easePar))
            }
            if (this.t1 < this.t) {
              if (this.tog) this.tog = 0
              else this.tog = 1
              this.settime()
            }
            this.t += p.random([1, 2, 4])
          }

          update2() {
            if (this.t >= 0 && this.t < this.t1) {
              const easePar = p.norm(this.t, 0, this.t1 - 1)
              this.rotate = p.lerp(-90, 90, Easing.easeOutBack(easePar))
            }
            if (this.t1 < this.t) {
              if (this.tog) this.tog = 0
              else this.tog = 1
              this.settime()
            }
            this.t += p.random([1, 2, 4])
          }

          update3() {
            if (this.t >= 0 && this.t < this.t1) {
              const easePar = p.norm(this.t, 0, this.t1 - 1)
              this.rotate = p.lerp(-90, 90, Easing.easeOutCirc(easePar))
            }
            if (this.t1 < this.t) {
              if (this.tog) this.tog = 0
              else this.tog = 1
              this.settime()
            }
            this.t += p.random([1, 2, 4])
          }

          run() {
            this.display()
            switch (p.int(p.random(3))) {
              case 0:
                this.update1()
                break
              case 1:
                this.update2()
                break
              case 2:
                this.update3()
                break
            }
          }
        }

        const drawRect = (x: number, y: number, w: number, h: number, pg: any) => {
          pg.strokeCap(p.SQUARE)
          pg.stroke(p.random(palette))
          pg.strokeWeight(w / p.random([1, 2]))
          pg.noFill()
          pg.drawingContext.setLineDash([5, 10, 15])
          pg.drawingContext.lineDashOffset = offset / p.random([1, 2])
          pg.line(x, y + h / 2, x + w / 2, y + h / 2)

          const splitWidth = p.random(1) > 0.5
          const splitWhere = p.random(0.1, 0.6)

          if (splitWidth && w > myGraphic.width / p.random([5, 4, 6])) {
            drawRect(x, y, w * splitWhere, h, pg)
            drawRect(x + w * splitWhere, y, w * (1 - splitWhere), h, pg)
          } else if (h > myGraphic.height / p.random([4, 8, 10])) {
            drawRect(x, y, w, h * splitWhere, pg)
            drawRect(x, y + h * splitWhere, w, h * (1 - splitWhere), pg)
          }
        }

        const createmyGraphic = () => {
          myGraphic.background(p.random(palette))
          myGraphic.strokeCap(p.SQUARE)
          myGraphic.stroke(p.random(palette))
          myGraphic.noFill()
          myGraphic.drawingContext.lineDashOffset = offset / 1

          if (p.int(seed) % 2 == 0) {
            myGraphic.strokeWeight(myGraphic.height / p.random([1, 1, 2]))
            myGraphic.line(myGraphic.width / 2, myGraphic.height / 1, myGraphic.width / 2, 0)
          }

          if (p.int(seed) % 2 == 1) {
            myGraphic.strokeWeight(myGraphic.width / p.random([1, 1, 2]))
            myGraphic.line(myGraphic.width, myGraphic.height / 2, 0, myGraphic.height / 2)
          }

          drawRect(0, 0, myGraphic.width, myGraphic.height, myGraphic)
        }

        p.setup = () => {
          p.randomSeed(seed)
          mySize = p.min(p.windowWidth, p.windowHeight) * 0.8
          margin = mySize / 100
          p.createCanvas(mySize, mySize, p.WEBGL)
          p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, -5000, 5000)

          myGraphic = p.createGraphics(mySize / 2, mySize / 2)
          frontGraphic = p.createGraphics(mySize / 2, mySize / 2)

          const selectedScheme = p.random(colorScheme)
          palette = selectedScheme.colors.map((c: string) => p.color(c))

          p.angleMode(p.DEGREES)
          num = p.int(p.random(1, 1))
          layer_num = num
          layer_w = p.width / layer_num
          layer_h = p.height / layer_num

          layers = []
          for (let i = 0; i < layer_num; i++) {
            for (let j = 0; j < layer_num; j++) {
              layers.push(new makeLayer(i * layer_w, j * layer_h, layer_w, 0))
            }
          }

          p.background(p.random(palette))
        }

        p.draw = () => {
          p.randomSeed(seed)
          p.orbitControl()
          p.background(p.random(palette))
          createmyGraphic()

          for (const l of layers) {
            l.run()
          }

          offset += 1
        }

        p.windowResized = () => {
          mySize = p.min(p.windowWidth, p.windowHeight) * 0.8
          margin = mySize / 100
          p.resizeCanvas(mySize, mySize)
          p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, -5000, 5000)

          myGraphic = p.createGraphics(mySize / 2, mySize / 2)
          frontGraphic = p.createGraphics(mySize / 2, mySize / 2)

          layer_num = num
          layer_w = p.width / layer_num
          layer_h = p.height / layer_num

          layers = []
          for (let i = 0; i < layer_num; i++) {
            for (let j = 0; j < layer_num; j++) {
              layers.push(new makeLayer(i * layer_w, j * layer_h, layer_w, 0))
            }
          }
        }

        p.keyTyped = () => {
          if (p.key === "s" || p.key === "S") {
            p.saveCanvas("genuary-20250114", "png")
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
