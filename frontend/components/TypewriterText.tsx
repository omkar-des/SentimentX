"use client"

import { useEffect, useState, useRef } from "react"

interface TypewriterTextProps {
  text: string
  speed?: number
  onDone?: () => void
}

export function TypewriterText({ text, speed = 18, onDone }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    indexRef.current = 0

    const tick = () => {
      if (indexRef.current < text.length) {
        indexRef.current++
        setDisplayed(text.slice(0, indexRef.current))
        timerRef.current = setTimeout(tick, speed)
      } else {
        setDone(true)
        onDone?.()
      }
    }

    timerRef.current = setTimeout(tick, 120)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && (
        <span
          className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom animate-pulse"
          style={{ background: "#3B82F6" }}
        />
      )}
    </span>
  )
}
