import React, { useContext, useState, useEffect } from "react"
import AppContext from "../context"
import { useCart } from "../hooks/useCart"
import { api } from "../api"
const BASE_URL = "/api";

function useRecommendations(currentUser) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentUser || !currentUser.id) {
        setLoading(false);
        return;
      }

      try {
          
        const res = await fetch(`${BASE_URL}/recommendations/${currentUser.id}/`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Если API возвращает объекты с полем `con_id`, приведём к ожидаемому формату
        const normalizedData = data.map((item) => ({
          id: item.con_id, // используем con_id как основной id
          title: item.name,
          price: item.price,
          category: item.category,
          imageUrl: item.imageurl || item.imageUrl, // на случай разных регистров
        }));

        setRecommendations(normalizedData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки рекомендаций:', err);
        setError(err.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser?.id]); // зависимость от currentUser.id

  return { recommendations, loading, error };
}

export function useDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/all_discounts/`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Ожидаем массив вроде: [{ min_amount: 10000, discount_percent: 5 }, ...]
        setDiscounts(data);
        setError(null);
      } catch (err) {
        console.error("Ошибка загрузки скидок:", err);
        setError(err.message);
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  return { discounts, loading, error };
}
function Orders() {
  
  const { cartItems, setCartItems, onRemoveItem, currentUser, onAddToCart } =
    useContext(AppContext)
  const { totalPrice } = useCart()
  const [orderStatus, setOrderStatus] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [deliveryMethod, setDeliveryMethod] = useState("krasnodar")
  const { recommendations, loading: recommendationsLoading } = useRecommendations(currentUser);
  const { discounts: discountRules, loading: discountsLoading } = useDiscounts();

  if (discountsLoading) {
    return <div className="content p-40">Загрузка скидок...</div>;
  }

  // Автоматический расчет скидки
    const calculateDiscount = (price) => {
    if (!discountRules.length) return 0;
    // Находим максимальную скидку, для которой price >= min_amount
    const applicable = discountRules
      .filter(rule => price >= rule.min_amount)
      .sort((a, b) => b.discount_percent - a.discount_percent); // сортируем по убыванию скидки
    return applicable.length ? applicable[0].discount_percent : 0;
  };

  const calculateNextDiscountInfo = (price) => {
    if (!discountRules.length) return null;

    // Сортируем правила по возрастанию min_amount
    const sortedRules = [...discountRules].sort((a, b) => a.min_amount - b.min_amount);
    const currentDiscount = calculateDiscount(price);

    // Ищем первое правило с БОЛЬШЕЙ скидкой
    const nextRule = sortedRules.find(rule => rule.discount_percent > currentDiscount);

    if (!nextRule) return null;

    const amountNeeded = nextRule.min_amount - price;
    return {
      amountNeeded: Math.max(0, amountNeeded),
      nextDiscount: nextRule.discount_percent,
      nextMin: nextRule.min_amount,
    };
  };

  const discount = calculateDiscount(totalPrice)
  const nextDiscountInfo = calculateNextDiscountInfo(totalPrice)

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      onRemoveItem(id)
    } else if (newQuantity <= 10) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const handleAddAdditionalProduct = (product) => {
    onAddToCart({
      ...product,
      parentId: product.id,
      size: 0,
      quantity: 1,
    })
  }

  const handleOrder = async () => {
    if (!currentUser || !currentUser.id) {
      setOrderStatus("Ошибка: пользователь не найден")
      return
    }
    if (cartItems.length === 0) {
      setOrderStatus("Корзина пуста")
      return
    }
    try {
      // Создаём заказ на сервере
      await api.createOrder(
        currentUser.id,
        cartItems.map((item) => ({
          sneaker_id: item.parentId,
          size: item.size,
          quantity: item.quantity,
        }))
      )
      setOrderStatus("Заказ оформлен!")
      setCartItems([])
      localStorage.removeItem("cartItems")
    } catch {
      setOrderStatus("Ошибка оформления заказа")
    }
  }

  const deliveryCost =
    totalPrice >= 20000 ? 0 : deliveryMethod === "krasnodar" ? 0 : 400
  const discountedPrice = totalPrice * (1 - discount / 100)
  const finalPrice = discountedPrice + deliveryCost

  return (
    <div className="content p-40">
      <div className="d-flex align-center justify-between mb-40">
        <h1>Мои заказы</h1>
      </div>

      <div className="cartItems">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h3>Корзина пуста</h3>
            <p>Добавьте товары, чтобы оформить заказ.</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cartItem d-flex align-center mb-20">
              <div
                style={{ backgroundImage: `url(${item.imageUrl})` }}
                className="cartItemImg"
              ></div>
              <div className="mr-20 flex">
                <p className="mb-5">{item.title}</p>
                {item.size !== "default" && (
                  <p className="mb-5">Размер: {item.size}</p>
                )}
                <b>
                  {(item.price * item.quantity).toFixed(2)} руб. (x
                  {item.quantity})
                </b>
              </div>
              <div className="cart-item-quantity d-flex align-center">
                <button
                  className="quantity-button minus"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  className="quantity-button plus"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= 10}
                >
                  +
                </button>
                <button
                  className="remove-button"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <img src="/img/btn-remove.svg" alt="Remove" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Секция "С этим товаром часто берут" → заменим на "Вам могут понравиться" */}
      {cartItems.length > 0 && (
        <div className="frequently-bought-section mb-30">
          <h2 className="mb-20">Вам могут понравиться</h2>
          <div className="additional-products-grid">
            {!recommendationsLoading && recommendations.length > 0 ? (
              recommendations.map((product) => (
                <div key={product.id} className="additional-product-card">
                  <div
                    className="additional-product-image"
                    style={{ backgroundImage: `url(${product.imageUrl})` }}
                  ></div>
                  <div className="additional-product-info">
                    <h4>{product.title}</h4>
                    <p className="additional-product-price">{product.price} руб.</p>
                    <button
                      className="add-additional-button"
                      onClick={() => handleAddAdditionalProduct(product)}
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              ))
            ) : recommendationsLoading ? (
              <p>Загрузка рекомендаций...</p>
            ) : (
              <p>Нет рекомендаций.</p>
            )}
          </div>
        </div>
      )}

      {cartItems.length > 0 && (
        <>
          <div className="order-options mb-30">
            {/* Автоматическая скидка */}
            {discount > 0 && (
              <div className="auto-discount-section mb-20">
                <h3>Ваша скидка</h3>
                <div className="discount-info">
                  <div className="discount-badge">
                    🎉 Автоматическая скидка {discount}%
                  </div>
                  <p className="discount-description">
                    {discount === 5 && "При покупке от 10,000 руб."}
                    {discount === 7 && "При покупке от 30,000 руб."}
                    {discount === 10 && "При покупке от 50,000 руб."}
                    {discount === 15 && "При покупке от 75,000 руб."}
                    {discount === 20 && "При покупке от 100,000 руб."}
                  </p>
                </div>
              </div>
            )}

            {/* Информация о следующей скидке */}
            {nextDiscountInfo && nextDiscountInfo.amountNeeded > 0 && (
              <div className="next-discount-section mb-20">
                <h3>До следующей скидки</h3>
                <div className="next-discount-info">
                  <div className="next-discount-badge">
                    💰 Добавьте товаров на{" "}
                    {nextDiscountInfo.amountNeeded.toFixed(0)} руб.
                  </div>
                  <p className="next-discount-description">
                    и получите скидку {nextDiscountInfo.nextDiscount}% при
                    покупке от {nextDiscountInfo.nextMin.toLocaleString()} руб.
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          (totalPrice / nextDiscountInfo.nextMin) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="progress-text">
                    {totalPrice.toLocaleString()} руб. из{" "}
                    {nextDiscountInfo.nextMin.toLocaleString()} руб.
                  </p>
                </div>
              </div>
            )}

            <div className="delivery-section mb-20">
              <h3>Способ доставки</h3>
              <div className="delivery-options">
                <label className="delivery-option">
                  <input
                    type="radio"
                    name="delivery"
                    value="krasnodar"
                    checked={deliveryMethod === "krasnodar"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <span>По Краснодару (бесплатно)</span>
                </label>
                <label className="delivery-option">
                  <input
                    type="radio"
                    name="delivery"
                    value="russia"
                    checked={deliveryMethod === "russia"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <span>По России (400 руб.)</span>
                </label>
              </div>
            </div>

            <div className="payment-section">
              <h3>Способ оплаты</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Оплата картой</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Наличными при получении</span>
                </label>
              </div>
            </div>
          </div>

          <div className="cartTotalBlock">
            <ul>
              <li>
                <span>Итого:</span>
                <div></div>
                <b>{totalPrice.toFixed(2)} руб.</b>
              </li>
              {discount > 0 && (
                <li className="discount-item">
                  <span>Скидка {discount}%:</span>
                  <div></div>
                  <b style={{ color: "#00C851" }}>
                    -{(totalPrice - discountedPrice).toFixed(2)} руб.
                  </b>
                </li>
              )}
              {deliveryCost > 0 && (
                <li>
                  <span>Доставка:</span>
                  <div></div>
                  <b>{deliveryCost.toFixed(2)} руб.</b>
                </li>
              )}
              <li>
                <span>К оплате:</span>
                <div></div>
                <b>{finalPrice.toFixed(2)} руб.</b>
              </li>
            </ul>
            <button
              onClick={handleOrder}
              className="greenButton"
              disabled={cartItems.length === 0}
            >
              Оформить заказ <img src="/img/arrow.svg" alt="Arrow" />
            </button>
            {orderStatus && <div className="notification">{orderStatus}</div>}
          </div>
        </>
      )}
    </div>
  )
}

export default Orders
