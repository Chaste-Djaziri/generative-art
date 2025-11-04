"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const hasRequestedMicRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()

    // Initialize particles
    const particleCount = 120
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2 + 2,
      })
    }
    particlesRef.current = particles

    // Configuration
    const connectionDistance = 150

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(42, 25, 13, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Get audio data if available
      let beatStrength = 0
      if (analyserRef.current && dataArrayRef.current) {
        const dataArray = dataArrayRef.current
        analyserRef.current.getByteFrequencyData(dataArray as any)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        beatStrength = avg / 255
      }

      const particles = particlesRef.current

      // Update particles
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        const scale = 1 + beatStrength * 1.8
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius * scale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,165,116,${0.6 + beatStrength * 0.6})`
        ctx.fill()
      })

      // Draw connections
      ctx.lineWidth = 1.2

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.5 * (1 + beatStrength)
            ctx.strokeStyle = `rgba(139,90,43,${opacity})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Auto-start audio visualizer
    const startVisualizer = async () => {
      if (hasRequestedMicRef.current) return
      hasRequestedMicRef.current = true

      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        micStreamRef.current = stream

        // Create audio context
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContextClass()
        audioContextRef.current = audioContext

        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        analyserRef.current = analyser
        dataArrayRef.current = dataArray as Uint8Array
        source.connect(analyser)
      } catch (error) {
        // Silently fail - animation will continue without audio reactivity
        console.log("Microphone access not available, running without audio visualization:", error)
      }
    }
    
    // Initialize audio (non-blocking)
    startVisualizer()

    // Start animation immediately
    animationRef.current = requestAnimationFrame(animate)

    // Handle window resize
    const handleResize = () => {
      resizeCanvas()
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
      
      // Cleanup audio
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}
