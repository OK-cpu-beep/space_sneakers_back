const BASE_URL = "/api";

// Временная имитация массива кроссовок (мок-данные)
const fetchSneakers = async () => {
  const response = await fetch(`${BASE_URL}/products/`);
  if (!response.ok) {
    console.warn("Не удалось загрузить кроссовки, возвращаем пустой массив");
    return [];
  }
  const data = await response.json();

  return data.map(item => {
    // Преобразуем sizes: [40, 41, 42] → { 40: true, 41: true, 42: true }
    let sizes = {};
    if (Array.isArray(item.sizes)) {
      sizes = item.sizes.reduce((acc, size) => {
        acc[size] = true;
        return acc;
      }, {});
    } else if (typeof item.sizes === 'object' && item.sizes !== null) {
      // Если sizes уже объект — оставляем как есть
      sizes = item.sizes;
    }

    return {
      ...item,
      gender: item.gender || "unisex",
      season: item.season || "",
      color: item.color || "",
      sizes: sizes,
      composition: item.composition || {},
      description: item.description || "Без описания",
    };
  });
};
// Дополнительные товары (стельки и шнурки)
const fetchAdditionalProducts = async () => {
  const response = await fetch(`${BASE_URL}/consumables/`);
  if (!response.ok) {
    console.warn("Не удалось загрузить аксессуары, используем пустой массив");
    return [];
  }
  const data = await response.json();
  // Добавляем недостающие поля, чтобы структура совпадала с MOCK_SNEAKERS
  return data.map(item => ({
    ...item,
    gender: "unisex",
    season: "",
    color: "",
    sizes: {},
    composition: {},
    description: item.title || "Без описания",
  }));
};

export const api = {
  // Получить все товары (кроссовки + аксессуары)
  getProducts: async () => {
    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 400))

    const MOCK_SNEAKERS = await fetchSneakers();
    // Получаем аксессуары из API
    const ADDITIONAL_PRODUCTS = await fetchAdditionalProducts();

    // Объединяем кроссовки и аксессуары
    const allProducts = [...MOCK_SNEAKERS, ...ADDITIONAL_PRODUCTS]

    // Преобразуем в формат, который ожидает фронт
    return allProducts.map((item) => ({
      id: item.id,
      title: item.name || item.title || "damn",
      price: item.price,
      imageUrl:
          item.id < 1000
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
