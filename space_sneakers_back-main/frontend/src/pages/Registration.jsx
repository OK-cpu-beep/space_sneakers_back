// src/pages/Registration.js
import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import AppContext from "../context"
import "../styles/Auth.scss"

function Registration() {
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogin, handleRegister } = React.useContext(AppContext)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.username || !formData.email || !formData.password) {
      setError("Заполните все поля")
      return
    }

    setIsLoading(true)
    const result = await handleRegister(
      formData.username,
      formData.email,
      formData.password
    )
    setIsLoading(false)

    if (result.success) {
      const from = location.state?.from || "/"
      navigate(from, { replace: true })
    } else {
      setError(result.message || "Ошибка регистрации")
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Заполните все поля")
      return
    }

    setIsLoading(true)
    const result = await handleLogin(formData.email, formData.password)
    setIsLoading(false)

    if (result.success) {
      const from = location.state?.from || "/"
      navigate(from, { replace: true })
    } else {
      setError(result.message || "Неверный email или пароль")
    }
  }

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev)
    setFormData({ username: "", email: "", password: "" })
    setError("")
  }

  return (
    <div className="content p-40">
      {isLoginMode ? (
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <h2>Вход в аккаунт</h2>

          <div className={`form-group ${error ? "error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите email"
              required
            />
          </div>

          <div className={`form-group ${error ? "error" : ""}`}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Войти"}
          </button>

          <div className="form-footer">
            <p>
              Нет аккаунта?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="toggle-button"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleRegistrationSubmit}>
          <h2>Регистрация</h2>

          <div className={`form-group ${error ? "error" : ""}`}>
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              required
            />
          </div>

          <div className={`form-group ${error ? "error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите email"
              required
            />
          </div>

          <div className={`form-group ${error ? "error" : ""}`}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              required
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Зарегистрироваться"}
          </button>

          <div className="form-footer">
            <p>
              Уже зарегистрированы?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="toggle-button"
              >
                Войти
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  )
}

export default Registration
