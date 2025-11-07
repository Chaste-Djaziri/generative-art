"use client"

import { useEffect, useRef, useState } from "react"

const SHOW_DURATION = 4 * 60 * 1000
const HIDE_DURATION = 60 * 1000
const CYCLE_DURATION = SHOW_DURATION + HIDE_DURATION

export function WelcomeOverlay() {
  const [isActive, setIsActive] = useState(true)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const scheduleHide = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      hideTimeoutRef.current = setTimeout(() => {
        setIsActive(false)
      }, SHOW_DURATION)
    }

    const startCycle = () => {
      setIsActive(true)
      scheduleHide()
    }

    startCycle()

    cycleIntervalRef.current = setInterval(() => {
      startCycle()
    }, CYCLE_DURATION)

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      <div className="absolute" style={{ left: "10%", bottom: "10%" }}>
        <div
          className={`flex flex-col gap-3 welcome-overlay ${
            isActive ? "welcome-overlay--visible" : "welcome-overlay--hidden"
          }`}
        >
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
