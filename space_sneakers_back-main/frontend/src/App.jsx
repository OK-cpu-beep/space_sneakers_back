import React, { useCallback, useMemo, useEffect, useState } from "react"
import { Route, Routes, Navigate } from "react-router-dom"
import Header from "./components/Header"
import Drawer from "./components/Drawer"
import ThemeToggle from "./components/ThemeToggle"
import AppContext from "./context"
import { ParallaxProvider } from "react-scroll-parallax"
import NeonParallaxBackground from "./components/NeonParallaxBackground"
import { api } from "./api"

import Home from "./pages/Home"
import Favorites from "./pages/Favorites"
import Orders from "./pages/Orders"
import Product from "./pages/Product"
import Registration from "./pages/Registration"

function App() {
  const [authChecked, setAuthChecked] = useState(false)
  const [items, setItems] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [cartId, setCartId] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [searchValue, setSearchValue] = useState("")
  const [cartOpened, setCartOpened] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [filters, setFilters] = useState({
    gender: "all",
    category: "all",
    season: "all",
    color: "all",
  })
  const [sortByPrice, setSortByPrice] = useState("default")

  // Загрузка товаров
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const products = await api.getProducts()
        setItems(products)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Проверка аутентификации и загрузка корзины из localStorage (для гостя)
    useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    const user = localStorage.getItem("currentUser")
    if (auth === "true" && user) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(user))
    } else {
      const savedCart = localStorage.getItem("cartItems")
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    }
    setAuthChecked(true) // ← ЭТА СТРОКА НОВАЯ — ВНЕ if/else!
  }, [])

  // Получение/создание корзины на сервере после логина/регистрации/обновления страницы
  // App.jsx

  useEffect(() => {
    const fetchCartForUser = async () => {
      // 1) Гость — показываем только localStorage
      if (!isAuthenticated || !currentUser?.id) {
        const saved = localStorage.getItem("cartItems")
        if (saved) {
          setCartItems(JSON.parse(saved))
        }
        return
      }

      try {
        // 2) Читаем гостевую корзину (список объектов { parentId, size, quantity })
        const guestCart = JSON.parse(localStorage.getItem("cartItems")) || []

        // 3) Подгружаем список корзин с сервера
        const carts = await api.getCart(currentUser.id)
        let activeCart = carts.find((c) => !c.is_paid)

        // 4) Если нет активной корзины — сразу создаём её с гостевыми товарами
        if (!activeCart) {
          activeCart = await api.createOrder({
            user_id: currentUser.id,
            items: guestCart.map((g) => ({
              sneaker_id: g.parentId,
              size: g.size,
              quantity: g.quantity,
            })),
          })
        }
        // 5) Если есть, но в localStorage ещё что-то осталось — мёржим один раз
        else if (guestCart.length) {
          // Собираем map существующих позиций
          const map = new Map()
          activeCart.items.forEach((i) => {
            map.set(`${i.sneaker.id}-${i.size}`, {
              sneaker_id: i.sneaker.id,
              size: i.size,
              quantity: i.quantity,
            })
          })
          // Добавляем из гостя только новые
          guestCart.forEach((g) => {
            const key = `${g.parentId}-${g.size}`
            if (!map.has(key)) {
              map.set(key, {
                sneaker_id: g.parentId,
                size: g.size,
                quantity: g.quantity,
              })
            }
          })
          // Отправляем мёрж на сервер
          await api.updateCart(activeCart.id, {
            items: Array.from(map.values()),
          })
          // Подгружаем заново, чтобы получить правильные item.id
          activeCart = (await api.getCart(currentUser.id)).find(
            (c) => !c.is_paid
          )
        }

        // 6) Форматируем для фронта и кладём в state + localStorage
        const formatted = (activeCart.items || []).map((i) => ({
          id: i.id,
          parentId: i.sneaker.id,
          title: i.sneaker.name,
          imageUrl: `/img/sneakers/${i.sneaker.id}.png`,
          price: i.sneaker.price,
          size: i.size,
          quantity: i.quantity,
        }))
        setCartItems(formatted)
        localStorage.setItem("cartItems", JSON.stringify(formatted))

        if (activeCart?.id) {
          setCartId(activeCart.id)
        }

        // 7) После успешного мержа очищаем гостевую
        if (guestCart.length) {
          localStorage.removeItem("cartItems")
        }
      } catch (err) {
        console.error("Cart sync error:", err)
      }
    }

    fetchCartForUser()
  }, [isAuthenticated, currentUser])

  // Синхронизация корзины с сервером (только для авторизованного)
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && currentUser && cartId) {
        try {
          await api.updateCart(
            cartId,
            cartItems.map((item) => ({
              sneaker_id: item.parentId,
              size: item.size,
              quantity: item.quantity,
            }))
          )
        } catch (error) {
          console.error("Ошибка обновления корзины на сервере:", error)
        }
      }
      // Для гостя корзина всегда в localStorage
      if (!isAuthenticated) {
        localStorage.setItem("cartItems", JSON.stringify(cartItems))
      }
    }
    syncCart()
  }, [cartItems, isAuthenticated, currentUser, cartId])

  const handleLogin = async (email, password) => {
    try {
      const user = await api.login(email, password)
      setIsAuthenticated(true)
      setCurrentUser(user)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("currentUser", JSON.stringify(user))
      /*
      // Передаем гостевую корзину
      const guestCart = JSON.parse(localStorage.getItem("cartItems")) || []
      if (guestCart.length > 0) {
        const carts = await api.getCart(user.id)
        let activeCart = carts.find((c) => !c.is_paid) || null
        setCartId(activeCart.id)

        if (!activeCart) {
          activeCart = await api.createOrder(user.id, [])
        }

        const mergedItems = [...guestCart].reduce((acc, item) => {
          const key = `${item.parentId}-${item.size}`
          if (acc[key]) {
            acc[key].quantity += item.quantity
          } else {
            acc[key] = { ...item }
          }
          return acc
        }, {})

        await api.updateCart(activeCart.id, Object.values(mergedItems))
        setCartItems(Object.values(mergedItems))

        //setHasJustMergedCart(true)
        
      }
      */
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
  const handleRegister = async (username, email, password) => {
    try {
      // 1) Регистрируем пользователя
      const user = await api.register(username, email, password)
      setIsAuthenticated(true)
      setCurrentUser(user)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("currentUser", JSON.stringify(user))
      /*
      const guestCart = JSON.parse(localStorage.getItem("cartItems")) || []
      if (guestCart.length > 0) {
        const carts = await api.getCart(user.id)
        let activeCart = carts.find((c) => !c.is_paid) || null
        setCartId(activeCart.id)

        if (!activeCart) {
          activeCart = await api.createOrder(user.id, [])
        }

        const mergedItems = [...guestCart].reduce((acc, item) => {
          const key = `${item.parentId}-${item.size}`
          if (acc[key]) {
            acc[key].quantity += item.quantity
          } else {
            acc[key] = { ...item }
          }
          return acc
        }, {})

        await api.updateCart(activeCart.id, Object.values(mergedItems))
        setCartItems(Object.values(mergedItems))
      }
      */
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCartId(null)
    setCartItems([])
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("currentUser")
    localStorage.removeItem("cartItems")
  }

  // Корзина и избранное
  const onAddToCart = useCallback(
    (obj) => {
      const findItem = cartItems.find(
        (item) =>
          Number(item.parentId) === Number(obj.id) &&
          item.size === (obj.size || "default")
      )
      if (findItem) {
        setCartItems((prev) =>
          prev.map((item) =>
            Number(item.parentId) === Number(obj.id) &&
            item.size === (obj.size || "default")
              ? {
                  ...item,
                  quantity: item.quantity + (obj.quantity || 1),
                }
              : item
          )
        )
      } else {
        setCartItems((prev) => [
          ...prev,
          {
            ...obj,
            id: Date.now(),
            parentId: obj.id,
            size: obj.size || "default",
            quantity: obj.quantity || 1,
          },
        ])
      }
    },
    [cartItems]
  )

  const onRemoveItem = useCallback((id) => {
    setCartItems((prev) =>
      prev.filter((item) => Number(item.id) !== Number(id))
    )
  }, [])

  const onAddToFavorite = useCallback(
    (obj) => {
      const exists = favorites.find((fav) => fav.id === obj.id)
      if (exists) {
        setFavorites((prev) => prev.filter((fav) => fav.id !== obj.id))
      } else {
        setFavorites((prev) => [...prev, obj])
      }
    },
    [favorites]
  )

  const onChangeSearchInput = useCallback((event) => {
    setSearchValue(event.target.value)
  }, [])

  const isItemAdded = useCallback(
    (id, size = "default") => {
      return cartItems.some(
        (obj) => Number(obj.parentId) === Number(id) && obj.size === size
      )
    },
    [cartItems]
  )

  const contextValue = useMemo(
    () => ({
      items,
      cartItems,
      favorites,
      isItemAdded,
      onAddToFavorite,
      onAddToCart,
      setCartOpened,
      setCartItems,
      isAuthenticated,
      setIsAuthenticated,
      onRemoveItem,
      currentUser,
      handleLogin,
      handleRegister,
      handleLogout,
      filters,
      setFilters,
      sortByPrice,
      setSortByPrice,
    }),
    [
      items,
      cartItems,
      favorites,
      isItemAdded,
      onAddToFavorite,
      onAddToCart,
      isAuthenticated,
      onRemoveItem,
      currentUser,
      filters,
      sortByPrice,
    ]
  )

  return (
    <ParallaxProvider>
      <NeonParallaxBackground />
      <AppContext.Provider value={contextValue}>
        <div className="wrapper clear">
          <ThemeToggle />
          <Drawer
            items={cartItems}
            onClose={() => setCartOpened(false)}
            onRemove={onRemoveItem}
            opened={cartOpened}
          />

          <Header onClickCart={() => setCartOpened(true)} />

          {authChecked ? (
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    items={items}
                    cartItems={cartItems}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onChangeSearchInput={onChangeSearchInput}
                    onAddToFavorite={onAddToFavorite}
                    onAddToCart={onAddToCart}
                    isLoading={isLoading}
                  />
                }
              />
              <Route path="/favorites" element={<Favorites />} />
              <Route
                path="/orders"
                element={
                  isAuthenticated ? (
                    <Orders />
                  ) : (
                    <Navigate to="/auth" state={{ from: "/orders" }} replace />
                  )
                }
              />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/auth" element={<Registration />} />
            </Routes>
          ) : (
            <div>Loading...</div> // или null, или спиннер
          )}
        </div>
      </AppContext.Provider>
    </ParallaxProvider>
  )
}

export default App
