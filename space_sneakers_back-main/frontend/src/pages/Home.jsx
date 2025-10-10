import React, { useContext } from "react"
import Card from "../components/Card"
import AppContext from "../context"

function Home({
  items,
  searchValue,
  setSearchValue,
  onChangeSearchInput,
  onAddToFavorite,
  onAddToCart,
  isLoading,
}) {
  const { filters, setFilters, sortByPrice, setSortByPrice } =
    useContext(AppContext)

  const handleFilterChange = (filterType, value) => {
    if (filterType === "price") {
      setSortByPrice(value)
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }))
    }
  }

  const handleResetFilters = () => {
    setFilters({ gender: "all", category: "all", season: "all", color: "all" })
    setSortByPrice("default")
  }

  const filteredItems = items.filter((item) => {
    return (
      (filters.gender === "all" || item.gender === filters.gender) &&
      (filters.category === "all" || item.category === filters.category) &&
      (filters.season === "all" || item.season === filters.season) &&
      (filters.color === "all" || item.color === filters.color) &&
      item.title.toLowerCase().includes(searchValue.toLowerCase())
    )
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortByPrice === "asc") {
      return a.price - b.price
    } else if (sortByPrice === "desc") {
      return b.price - a.price
    }
    return 0
  })

  return (
    <div className="content p-40">
      <div className="d-flex align-center justify-between mb-40">
        <h1>
          {searchValue
            ? `Поиск по запросу: "${searchValue}"`
            : filters.category === "all"
            ? "Все товары"
            : filters.category === "sneakers"
            ? "Кроссовки"
            : filters.category === "insoles"
            ? "Стельки"
            : filters.category === "laces"
            ? "Шнурки"
            : "Все товары"}
        </h1>
        <div className="search-block d-flex">
          <img src="/img/search.svg" alt="Search" />
          <input
            onChange={onChangeSearchInput}
            value={searchValue}
            placeholder="Поиск..."
          />
          {searchValue && (
            <img
              onClick={() => setSearchValue("")}
              className="clear cu-p"
              src="/img/btn-remove.svg"
              alt="Clear"
            />
          )}
        </div>
      </div>

      <div className="filters mb-40">
        <div className="filter-group">
          <label>Пол:</label>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange("gender", e.target.value)}
          >
            <option value="all">Все</option>
            <option value="male">Мужские</option>
            <option value="female">Женские</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Категория:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="all">Все товары</option>
            <option value="sneakers">Кроссовки</option>
            <option value="insoles">Стельки</option>
            <option value="laces">Шнурки</option>
          </select>
        </div>

        {/*    <div className="filter-group">
          <label>Сезон:</label>
          <select
            value={filters.season}
            onChange={(e) => handleFilterChange("season", e.target.value)}
          >
            <option value="all">Все</option>
            <option value="summer">Лето</option>
            <option value="winter">Зима</option>
            <option value="spring">Весна</option>
            <option value="autumn">Осень</option>
          </select>
        </div> */}

        {/*      <div className="filter-group">
          <label>Цвет:</label>
          <select
            value={filters.color}
            onChange={(e) => handleFilterChange("color", e.target.value)}
          >
            <option value="all">Все</option>
            <option value="black">Черный</option>
            <option value="white">Белый</option>
            <option value="red">Красный</option>
            <option value="blue">Синий</option>
            <option value="green">Зеленый</option>
            <option value="yellow">Желтый</option>
          </select>
        </div> */}

        <div className="filter-group">
          <label>Сортировка по цене:</label>
          <select
            value={sortByPrice}
            onChange={(e) => handleFilterChange("price", e.target.value)}
          >
            <option value="default">Без сортировки</option>
            <option value="asc">Сначала дешевые</option>
            <option value="desc">Сначала дорогие</option>
          </select>
        </div>

        <button
          className="sort-button"
          style={{ marginTop: 20 }}
          onClick={handleResetFilters}
        >
          Сбросить фильтры
        </button>
      </div>

      <div className="d-flex flex-wrap">
        {isLoading ? (
          <p>Загрузка...</p>
        ) : sortedItems.length > 0 ? (
          sortedItems.map((item) => (
            <Card
              key={item.id}
              {...item}
              onFavorite={(obj) => onAddToFavorite(obj)}
              onPlus={(obj) => onAddToCart(obj)}
              loading={isLoading}
            />
          ))
        ) : (
          <p>Товары не найдены</p>
        )}
      </div>
    </div>
  )
}

export default Home
