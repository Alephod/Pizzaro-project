'use client'

import { useEffect, useState } from 'react'

import { Button } from './../button/Button'

interface TimeSlotsProps {
  selected: string;
  onSelect: (slot: string) => void;
}

export function TimeSlots({ selected, onSelect }: TimeSlotsProps) {
  const [slots, setSlots] = useState<string[]>([])

  useEffect(() => {
    const now = new Date()
    const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15
    const roundedTime = new Date(now)

    roundedTime.setMinutes(roundedMinutes)
    roundedTime.setSeconds(0)
    roundedTime.setMilliseconds(0)

    if (roundedMinutes === 60) {
      roundedTime.setHours(roundedTime.getHours() + 1)
      roundedTime.setMinutes(0)
    }

    const firstSlotStart = new Date(roundedTime.getTime() + 30 * 60 * 1000)
    const newSlots: string[] = []

    for (let i = 0; i < 8; i++) {
      const from = new Date(firstSlotStart.getTime() + i * 15 * 60 * 1000)
      const to = new Date(from.getTime() + 15 * 60 * 1000)
      const fromStr = from.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      const toStr = to.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

      newSlots.push(`${fromStr}–${toStr}`)
    }

    setSlots(newSlots)
  }, [])

  if (slots.length === 0) return null

  return (
    <>
      {slots.map((slot) => (
        <Button
          key={slot}
          size="md"
          variant={selected === slot ? 'primary' : 'secondary'}
          onClick={() => onSelect(slot)}
        >
          {slot}
        </Button>
      ))}
    </>
  )
}