// src/components/Header.js
import React, { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../hooks/useCart"
import AppContext from "../context"

function Header(props) {
  const { totalPrice } = useCart()
  const { isAuthenticated, handleLogout } = useContext(AppContext)
  const navigate = useNavigate()

  return (
    <header className="d-flex justify-between align-center">
      <Link to="/">
        <div className="d-flex align-center">
          <img width={40} height={40} src="/img/logo.png" alt="Logotype" />
          <div>
            <h3 className="text-uppercase">Space Sneakers</h3>
            <p className="opacity-5">Магазин космических кроссовок</p>
          </div>
        </div>
      </Link>
      <ul className="d-flex">
        <li onClick={props.onClickCart} className="cu-p">
          <img width={18} height={18} src="/img/cart.svg" alt="Корзина" />
          <span>{totalPrice.toFixed(2)} руб.</span>
        </li>
        <li className="cu-p">
          <Link to="/favorites">
            <img width={18} height={18} src="/img/heart.svg" alt="Закладки" />
          </Link>
        </li>
        <li>
          {isAuthenticated ? (
            <div className="d-flex align-center">
              <Link to="/orders" className="mr-20">
                <img
                  width={18}
                  height={18}
                  src="/img/user.svg"
                  alt="Пользователь"
                />
              </Link>

              <button onClick={handleLogout} className="logout-button">
                Выйти
              </button>
            </div>
          ) : (
            <Link to="/auth">
              <img
                width={18}
                height={18}
                src="/img/user.svg"
                alt="Пользователь"
              />
            </Link>
          )}
        </li>
      </ul>
    </header>
  )
}

export default Header
