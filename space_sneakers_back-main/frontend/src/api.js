const BASE_URL = "/api";

// Временная имитация массива кроссовок (мок-данные)
const MOCK_SNEAKERS = [
  {
    id: 1,
    title: "Nike Air Max 90",
    price: 12990,
    gender: "unisex",
    category: "sneakers",
    season: "summer",
    color: "white/red",
    sizes: { 40: true, 41: true, 42: true, 43: true },
    composition: { upper: "textile", sole: "rubber" },
    description: "Классическая модель с амортизацией Air.",
  },
  {
    id: 2,
    title: "Adidas Ultraboost 22",
    price: 15990,
    gender: "men",
    category: "sneakers",
    season: "spring",
    color: "black",
    sizes: { 41: true, 42: true, 43: true, 44: true },
    composition: { upper: "primeknit", sole: "boost" },
    description: "Комфорт и возврат энергии на каждое движение.",
  },
  {
    id: 3,
    title: "Puma Suede Classic",
    price: 7990,
    gender: "women",
    category: "sneakers",
    season: "autumn",
    color: "green",
    sizes: { 36: true, 37: true, 38: true, 39: true },
    composition: { upper: "suede", sole: "rubber" },
    description: "Легендарные замшевые кеды на каждый день.",
  },
  {
    id: 4,
    title: "New Balance 574",
    price: 9990,
    gender: "unisex",
    category: "sneakers",
    season: "winter",
    color: "grey",
    sizes: { 40: true, 41: true, 42: true },
    composition: { upper: "suede/textile", sole: "eva/rubber" },
    description: "Баланс комфорта и стиля.",
  },
  {
    id: 5,
    title: "Asics Gel-Kayano 28",
    price: 17990,
    gender: "men",
    category: "sneakers",
    season: "summer",
    color: "blue",
    sizes: { 41: true, 42: true, 43: true },
    composition: { upper: "mesh", sole: "gel" },
    description: "Стабильность и поддержка на длинные дистанции.",
  },
  {
    id: 6,
    title: "Reebok Club C 85",
    price: 7490,
    gender: "women",
    category: "sneakers",
    season: "spring",
    color: "white",
    sizes: { 36: true, 37: true, 38: true },
    composition: { upper: "leather", sole: "rubber" },
    description: "Чистая классика 80-х.",
  },
  {
    id: 7,
    title: "Nike Dunk Low",
    price: 11990,
    gender: "unisex",
    category: "sneakers",
    season: "summer",
    color: "multi",
    sizes: { 40: true, 41: true, 42: true, 43: true },
    composition: { upper: "leather", sole: "rubber" },
    description: "Икона уличного стиля.",
  },
  {
    id: 8,
    title: "Jordan 1 Mid",
    price: 14990,
    gender: "men",
    category: "sneakers",
    season: "autumn",
    color: "black/red",
    sizes: { 41: true, 42: true, 43: true, 44: true },
    composition: { upper: "leather", sole: "rubber" },
    description: "Легенда баскетбола с богатой историей.",
  },
]

// Дополнительные товары (стельки и шнурки)
const ADDITIONAL_PRODUCTS = [
  {
    id: 1001,
    title: "Гелевые стельки Nike",
    price: 1990,
    gender: "unisex",
    category: "insoles",
    season: "",
    color: "",
    sizes: {},
    composition: {},
    description: "Комфортные гелевые стельки для максимального удобства.",
  },
  {
    id: 1002,
    title: "Ортопедические стельки Adidas",
    price: 2490,
    gender: "unisex",
    category: "insoles",
    season: "",
    color: "",
    sizes: {},
    composition: {},
    description: "Ортопедические стельки для поддержки стопы.",
  },
  {
    id: 1003,
    title: "Шнурки Nike (белые)",
    price: 490,
    gender: "unisex",
    category: "laces",
    season: "",
    color: "white",
    sizes: {},
    composition: {},
    description: "Классические белые шнурки Nike.",
  },
  {
    id: 1004,
    title: "Шнурки Adidas (черные)",
    price: 590,
    gender: "unisex",
    category: "laces",
    season: "",
    color: "black",
    sizes: {},
    composition: {},
    description: "Стильные черные шнурки Adidas.",
  },
  {
    id: 1005,
    title: "Шнурки Jordan (красные)",
    price: 690,
    gender: "unisex",
    category: "laces",
    season: "",
    color: "red",
    sizes: {},
    composition: {},
    description: "Яркие красные шнурки Jordan.",
  },
]

export const api = {
  // Получить все товары (кроссовки + аксессуары)
  getProducts: async () => {
    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Объединяем кроссовки и аксессуары
    const allProducts = [...MOCK_SNEAKERS, ...ADDITIONAL_PRODUCTS]

    // Преобразуем в формат, который ожидает фронт
    return allProducts.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      imageUrl:
        item.category === "sneakers"
          ? `/img/sneakers/${item.id}.png`
          : item.category === "insoles"
          ? `/img/accessories/insoles-${item.id - 1000}.png`
          : item.id === 1003
          ? `/img/accessories/laces-1.png`
          : item.id === 1004
          ? `/img/accessories/laces-2.png`
          : item.id === 1005
          ? `/img/accessories/laces-3.png`
          : `/img/accessories/laces-1.png`,
      gender: item.gender,
      category: item.category,
      season: item.season || "",
      color: item.color || "",
      sizes: item.sizes || {},
      composition: item.composition || {},
      description: item.description || "",
    }))
  },

  // Логин
  login: async (email, password) => {
    // Временная имитация логина для тестирования
    if (email === "aboba@mail.ru" && password === "123") {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 500))

      return {
        id: 1,
        username: "aboba",
        email: "aboba@mail.ru",
        message: "Успешный вход в систему",
      }
    }

    // Для остальных случаев - реальный запрос к серверу
    const response = await fetch(`${BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Ошибка входа")
    }
    return await response.json()
  },

  // Регистрация
  register: async (username, email, password) => {
    // Временная имитация регистрации для тестирования
    if (email === "aboba@mail.ru" && password === "123") {
      // Имитация задержки сети
      await new Promise((resolve) => setTimeout(resolve, 500))

      return {
        id: 1,
        username: username || "aboba",
        email: "aboba@mail.ru",
        message: "Регистрация прошла успешно",
      }
    }

    // Для остальных случаев - реальный запрос к серверу
    const response = await fetch(`${BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name:username, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Ошибка регистрации")
    }
    return await response.json()
  },

  // Получить корзину пользователя
  getCart: async (userId) => {
    const response = await fetch(`${BASE_URL}/orders/${userId}/`)
    if (!response.ok) {
      throw new Error("Ошибка загрузки корзины")
    }
    return await response.json()
  },

  // Обновить корзину пользователя
  updateCart: async (cartId, cartItems) => {
    const response = await fetch(`${BASE_URL}/orders/${cartId}/update/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartItems }),
    })
    if (!response.ok) {
      throw new Error("Ошибка обновления корзины")
    }
    return await response.json()
  },
  // Создать новый заказ (корзину)
  createOrder: async (userId, cartItems) => {
    const response = await fetch(`${BASE_URL}/orders/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, items: cartItems }),
    })

    if (!response.ok) {
      throw new Error("Ошибка оформления заказа")
    }
    return await response.json()
  },

  // Удалить заказ
  deleteOrder: async (cartId) => {
    const response = await fetch(
      `${BASE_URL}/sneakers/orders/delete/${cartId}/`,
      {
        method: "DELETE",
      }
    )
    if (!response.ok) {
      throw new Error("Ошибка удаления заказа")
    }
    return await response.json()
  },
}
