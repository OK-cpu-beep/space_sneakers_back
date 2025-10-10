import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AppContext from "../context"

function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, onAddToCart, isItemAdded } = React.useContext(AppContext)
  const [selectedSize, setSelectedSize] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const product = items.find((item) => item.id === Number(id))

  // Показываем загрузку пока товары не загружены
  if (items.length === 0) {
    return (
      <div className="product">
        <div className="product__header">
          <button onClick={() => navigate(-1)} className="product__back">
            <img src="/img/btn-remove.svg" alt="Back" />
          </button>
          <h1>Загрузка...</h1>
        </div>
        <div className="product__content">
          <div style={{ textAlign: "center", padding: "50px" }}>
            Загружаем товар...
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product">
        <div className="product__header">
          <button onClick={() => navigate(-1)} className="product__back">
            <img src="/img/btn-remove.svg" alt="Back" />
          </button>
          <h1>Товар не найден</h1>
        </div>
        <div className="product__content">
          <div style={{ textAlign: "center", padding: "50px" }}>
            Товар с ID {id} не найден
          </div>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    // Для аксессуаров (стельки, шнурки) размер не требуется
    if (product.category === "sneakers" && !selectedSize) {
      alert("Пожалуйста, выберите размер")
      return
    }

    onAddToCart({
      ...product,
      parentId: product.id,
      size: selectedSize || "default", // Для аксессуаров используем "default"
      quantity: quantity,
    })

    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="product">
      <div className="product__header">
        <button onClick={() => navigate(-1)} className="product__back">
          <img src="/img/btn-remove.svg" alt="Back" />
        </button>
        <h1>{product.title}</h1>
      </div>

      <div className="product__content">
        <div className="product__image">
          <img src={product.imageUrl} alt={product.title} />
        </div>

        <div className="product__info">
          <div className="product__price">{product.price} руб.</div>

          <div className="product__section">
            <h3>Описание</h3>
            <div className="product__description mb-20">
              <p className="description">{product.description}</p>
            </div>
          </div>

          {product.category === "sneakers" && (
            <div className="product__section">
              <h3>Размер</h3>
              <div className="product__sizes">
                {product.sizes &&
                  Object.keys(product.sizes).map((size) => (
                    <button
                      key={size}
                      className={`product__size ${
                        selectedSize === size ? "active" : ""
                      } ${isItemAdded(product.id, size) ? "added" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="product__section">
            <h3>Пол</h3>
            <p>
              {product.gender === "male"
                ? "Мужской"
                : product.gender === "female"
                ? "Женский"
                : "Унисекс"}
            </p>
          </div>

          <div className="product__section">
            <h3>Категория</h3>
            <p>
              {product.category === "sneakers"
                ? "Кроссовки"
                : product.category === "insoles"
                ? "Стельки"
                : product.category === "laces"
                ? "Шнурки"
                : product.category}
            </p>
          </div>

          <div className="product__section">
            <h3>Сезонность</h3>
            <p>Всесезонные</p>
          </div>

          <div className="product__section">
            <h3>Материалы</h3>
            <div className="product__sizes">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {product.composition &&
                  Object.entries(product.composition).map(
                    ([key, value], index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: "#f0f0f0",
                          color: "#333",
                          padding: "6px 12px",
                          borderRadius: "9999px",
                          whiteSpace: "nowrap",
                          fontSize: "14px",
                        }}
                      >
                        {key}: {value}
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>

          <div className="product__section">
            <h3>Количество</h3>
            <div className="quantity-selector">
              <button
                className="quantity-button minus"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button
                className="quantity-button plus"
                onClick={increaseQuantity}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="greenButton"
            onClick={handleAddToCart}
            disabled={isItemAdded(product.id, selectedSize)}
          >
            {isItemAdded(product.id, selectedSize)
              ? "В корзине"
              : "Добавить в корзину"}
          </button>
        </div>
      </div>

      {showNotification && (
        <div className="notification">Товар добавлен в корзину!</div>
      )}
    </div>
  )
}

export default Product
