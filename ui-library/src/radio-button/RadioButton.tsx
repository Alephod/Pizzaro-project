'use client'

import { useRef, useEffect } from 'react'

import clsx from 'clsx'

import style from './RadioButton.module.scss'

interface RadioButtonProps {
    options: string[];
    selected: string;
    customStyle?: React.CSSProperties;
    onChange: (value: string) => void;
}

export function RadioButton({ options, selected, onChange, customStyle }: RadioButtonProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<HTMLButtonElement[]>([])

  useEffect(() => {
    const index = options.findIndex(opt => opt === selected)

    if (index !== -1 && optionRefs.current[index]) {
      const btn = optionRefs.current[index]
      const left = btn.offsetLeft
      const width = btn.clientWidth

      if (sliderRef.current) {
        sliderRef.current.style.left = `${left}px`
        sliderRef.current.style.width = `${width}px`
      }
    }
  }, [selected, options])

  return (
    <div style={customStyle} className={style.wrapper}>
      {options.map((opt, index) => (
        <button
          type="button"
          key={opt}
          ref={el => {
            if (el) optionRefs.current[index] = el
          }}
          className={clsx(style.button, selected === opt ? style.buttonSelected : '')}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
      <div className={style.slider} ref={sliderRef} />
    </div>
  )
}
