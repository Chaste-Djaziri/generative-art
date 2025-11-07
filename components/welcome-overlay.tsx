"use client"

import { useEffect, useState } from "react"

export function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <div className="absolute" style={{ left: "10%", bottom: "10%" }}>
        <div className={`flex flex-col gap-3 welcome-overlay ${isVisible ? "welcome-overlay--visible" : ""}`}>
          <span className="inline-flex w-max items-center bg-[#f5e1c0] px-9 py-3 text-base uppercase tracking-[0.65em] text-amber-900 shadow-lg shadow-black/20">
            welcome
          </span>
          <span className="inline-flex w-max items-center bg-[#f5e1c0] px-12 py-4 text-5xl font-semibold uppercase tracking-[0.14em] text-amber-950 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
            to our home
          </span>
        </div>
      </div>
    </div>
  )
}
