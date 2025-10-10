import React from "react"
import { useNavigate } from "react-router-dom"
import ContentLoader from "react-content-loader"

import styles from "./Card.module.scss"

function Card({
  id,
  title,
  price,
  category,
  onFavorite,
  favorited = false,
  loading = false,
}) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = React.useState(favorited)
  const obj = { id, parentId: id, title, price, category }

  const onClickFavorite = (e) => {
    e.stopPropagation()
    onFavorite(obj)
    setIsFavorite(!isFavorite)
  }

  const onClickCard = () => {
    navigate(`/product/${id}`)
  }

  // Формируем динамический путь к картинке по id и категории
  const getImagePath = () => {
    if (category === "sneakers") {
      return `/img/sneakers/${id}.png`
    } else if (category === "insoles") {
      return `/img/accessories/insoles-${id - 1000}.png`
    } else if (category === "laces") {
      if (id === 1003) return `/img/accessories/laces-1.png`
      if (id === 1004) return `/img/accessories/laces-2.png`
      if (id === 1005) return `/img/accessories/laces-3.png`
      return `/img/accessories/laces-1.png` // fallback
    }
    return `/img/sneakers/${id}.png` // fallback
  }

  const imagePath = getImagePath()

  return (
    <div className={styles.card} onClick={onClickCard}>
      {loading ? (
        <ContentLoader
          speed={2}
          width={155}
          height={250}
          viewBox="0 0 155 265"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="1" y="0" rx="10" ry="10" width="155" height="155" />
          <rect x="0" y="167" rx="5" ry="5" width="155" height="15" />
          <rect x="0" y="187" rx="5" ry="5" width="100" height="15" />
          <rect x="1" y="234" rx="5" ry="5" width="80" height="25" />
          <rect x="124" y="230" rx="10" ry="10" width="32" height="32" />
        </ContentLoader>
      ) : (
        <>
          {onFavorite && (
            <div className={styles.favorite} onClick={onClickFavorite}>
              <img
                src={isFavorite ? "/img/liked.svg" : "/img/unliked.svg"}
                alt={isFavorite ? "Liked" : "Unliked"}
              />
            </div>
          )}
          <img width="100%" height={135} src={imagePath} alt={title} />
          <h5>{title}</h5>
          <div className="d-flex justify-between align-center">
            <div className="d-flex flex-column">
              <span>Цена:</span>
              <b>{price} руб.</b>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Card
