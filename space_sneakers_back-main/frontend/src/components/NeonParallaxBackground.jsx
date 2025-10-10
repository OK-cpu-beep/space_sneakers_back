import React, { useEffect, useRef } from "react"

const PARTICLE_COUNT = 25
const PARTICLE_COLORS = ["#fff", "#9d00ff", "#00ffe7", "#ff00ff"]

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function NeonParallaxBackground() {
  const ref = useRef()
  const particlesRef = useRef([])
  const mouse = useRef({ x: 0.5, y: 0.5 })

  // Параллакс неоновых кругов
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      if (ref.current) {
        ref.current.style.setProperty("--parallax1", `${scrollY * 0.15}px`)
        ref.current.style.setProperty("--parallax2", `${-scrollY * 0.1}px`)
        ref.current.style.setProperty("--parallax3", `${scrollY * 0.07}px`)
        ref.current.style.setProperty("--parallax4", `${-scrollY * 0.05}px`)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Космические частицы
  useEffect(() => {
    // Инициализация частиц
    const particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: randomBetween(0, 1),
      y: randomBetween(0, 1),
      r: randomBetween(1, 2.5),
      color:
        PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      baseX: 0,
      baseY: 0,
      speed: randomBetween(0.1, 0.5),
    }))
    particlesRef.current = particles
    let frame
    const animate = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      for (let p of particlesRef.current) {
        // Плавное движение к базовой позиции + реакция на мышь
        p.baseX = p.x * w + (mouse.current.x - 0.5) * 30 * p.speed
        p.baseY = p.y * h + (mouse.current.y - 0.5) * 30 * p.speed
      }
      if (ref.current) {
        const ctx = ref.current.querySelector("canvas").getContext("2d")
        ctx.clearRect(0, 0, w, h)
        for (let p of particlesRef.current) {
          ctx.beginPath()
          ctx.arc(p.baseX, p.baseY, p.r, 0, 2 * Math.PI)
          ctx.fillStyle = p.color
          ctx.globalAlpha = 0.5
          ctx.shadowColor = p.color
          ctx.shadowBlur = 6
          ctx.fill()
        }
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
      frame = setTimeout(animate, 1000 / 30) // ~30 FPS
    }
    animate()
    return () => clearTimeout(frame)
  }, [])

  // Реакция на мышку
  useEffect(() => {
    const handleMouse = (e) => {
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = e.clientY / window.innerHeight
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = ref.current.querySelector("canvas")
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        zIndex: 0,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Космические частицы */}
      <canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      />
      {/* Неоновые круги/градиенты */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, #9d00ff 0%, transparent 70%)",
          filter: "blur(30px)",
          opacity: 0.4,
          transform: "translateY(var(--parallax1, 0px))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "70%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, #00ffe7 0%, transparent 70%)",
          filter: "blur(35px)",
          opacity: 0.3,
          transform: "translateY(var(--parallax2, 0px))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "80%",
          left: "20%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ff00ff 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.25,
          transform: "translateY(var(--parallax3, 0px))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "60%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          filter: "blur(20px)",
          opacity: 0.1,
          transform: "translateY(var(--parallax4, 0px))",
        }}
      />
    </div>
  )
}
