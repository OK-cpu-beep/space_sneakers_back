import React, { useState } from "react"
import styles from "./PromoRoulette.module.scss"

const promoCodes = [
  { label: "5%", code: "SALE5", color: "#9d00ff", weight: 55 },
  { label: "10%", code: "SALE10", color: "#00ffe7", weight: 25 },
  { label: "15%", code: "SALE15", color: "#ff00ff", weight: 15 },
  { label: "20%", code: "SALE20", color: "#00ff57", weight: 5 },
]

const RADIUS = 140
const CENTER = 150
const WHEEL_SIZE = 300

function getSegmentPath(startAngle, endAngle, radius, center) {
  const startRad = (startAngle - 90) * (Math.PI / 180)
  const endRad = (endAngle - 90) * (Math.PI / 180)
  const x1 = center + radius * Math.cos(startRad)
  const y1 = center + radius * Math.sin(startRad)
  const x2 = center + radius * Math.cos(endRad)
  const y2 = center + radius * Math.sin(endRad)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`
}

function getTextPosition(startAngle, endAngle, radius, center) {
  const midAngle = (startAngle + endAngle) / 2
  const rad = (midAngle - 90) * (Math.PI / 180)
  const x = center + radius * 0.52 * Math.cos(rad)
  const y = center + radius * 0.52 * Math.sin(rad)
  return { x, y, angle: midAngle }
}

function getWeightedRandomIndex(weights) {
  const total = weights.reduce((sum, w) => sum + w, 0)
  const rnd = Math.random() * total
  let acc = 0
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i]
    if (rnd < acc) return i
  }
  return weights.length - 1
}

export default function PromoRoulette() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [won, setWon] = useState(null)

  // Вычисляем углы для каждого сегмента
  const totalWeight = promoCodes.reduce((sum, seg) => sum + seg.weight, 0)
  let currentAngle = 0
  const segments = promoCodes.map((seg) => {
    const angle = (seg.weight / totalWeight) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    return { ...seg, startAngle, endAngle }
  })

  const spinWheel = () => {
    if (isSpinning || won) return
    setIsSpinning(true)
    const weights = segments.map((seg) => seg.weight)
    const winner = getWeightedRandomIndex(weights)
    // Рассчитываем угол для победного сегмента
    const seg = segments[winner]
    const midAngle = (seg.startAngle + seg.endAngle) / 2
    const extraSpins = 7
    const finalRotation = 360 * extraSpins + (360 - midAngle)
    setRotation((prev) => prev + finalRotation)
    setTimeout(() => {
      const totalRot = rotation + finalRotation
      // Угол стрелки всегда 0° (верх круга), но относительно круга это -rotation
      const pointerAngle = (360 - (totalRot % 360) + 360) % 360
      let winnerIdx = 0
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        // Обычный сектор
        if (seg.startAngle < seg.endAngle) {
          if (pointerAngle > seg.startAngle && pointerAngle <= seg.endAngle) {
            winnerIdx = i
            break
          }
        } else {
          // wrap-around сектор (например, от 350° до 20°)
          if (pointerAngle > seg.startAngle || pointerAngle <= seg.endAngle) {
            winnerIdx = i
            break
          }
        }
      }
      setWon(segments[winnerIdx])
      setIsSpinning(false)
    }, 5500)
  }

  return (
    <div className={styles.rouletteContainer}>
      <h2>Крутите рулетку и получите промокод!</h2>
      <div className={styles.wheelContainer}>
        <svg
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          style={{
            transition: isSpinning
              ? "transform 5.5s cubic-bezier(0.17,0.67,0.12,1)"
              : undefined,
            transform: `rotate(${rotation}deg)`,
            filter: "drop-shadow(0 0 30px #9d00ff)",
            borderRadius: "50%",
            background: "#18181c",
          }}
        >
          {segments.map((seg, i) => (
            <path
              key={i}
              d={getSegmentPath(seg.startAngle, seg.endAngle, RADIUS, CENTER)}
              fill={seg.color}
              stroke="#fff"
              strokeWidth="3"
              style={{ filter: `drop-shadow(0 0 10px ${seg.color})` }}
            />
          ))}
          {segments.map((seg, i) => {
            const { x, y } = getTextPosition(
              seg.startAngle,
              seg.endAngle,
              RADIUS,
              CENTER
            )
            return (
              <text
                key={i}
                x={x}
                y={y}
                fill="#fff"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
                style={{
                  textShadow: `0 0 8px ${seg.color}, 0 0 2px #fff`,
                  filter: `drop-shadow(0 0 6px ${seg.color})`,
                  userSelect: "none",
                }}
              >
                {seg.label}
              </text>
            )
          })}
        </svg>
        <div className={styles.pointer} />
      </div>
      <button
        className={styles.spinButton}
        onClick={spinWheel}
        disabled={isSpinning || won}
      >
        Крутить рулетку
      </button>
      {won && (
        <div className={styles.result}>
          <p>Ваш промокод:</p>
          <div className="promoCode">
            {won.code} ({won.label})
          </div>
        </div>
      )}
    </div>
  )
}
