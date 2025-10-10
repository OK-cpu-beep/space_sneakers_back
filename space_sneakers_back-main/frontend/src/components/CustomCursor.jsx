import React, { useEffect, useRef } from "react"

export default function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const move = (e) => {
      cursor.style.left = e.clientX + "px"
      cursor.style.top = e.clientY + "px"
    }
    const down = () => cursor.classList.add("active")
    const up = () => cursor.classList.remove("active")

    window.addEventListener("mousemove", move)
    window.addEventListener("mousedown", down)
    window.addEventListener("mouseup", up)

    // Наведение на интерактивные элементы
    const addHover = (e) => {
      if (
        e.target.closest("button, a, input, textarea, select, [role='button']")
      ) {
        cursor.classList.add("active")
      }
    }
    const removeHover = (e) => {
      if (
        e.target.closest("button, a, input, textarea, select, [role='button']")
      ) {
        cursor.classList.remove("active")
      }
    }
    window.addEventListener("mouseover", addHover)
    window.addEventListener("mouseout", removeHover)

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mousedown", down)
      window.removeEventListener("mouseup", up)
      window.removeEventListener("mouseover", addHover)
      window.removeEventListener("mouseout", removeHover)
    }
  }, [])

  return <div className="custom-cursor" ref={cursorRef} />
}
