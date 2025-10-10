// src/context.js
import React from "react"

const AppContext = React.createContext({
  items: [],
  cartItems: [],
  favorites: [],
  isItemAdded: () => false,
  onAddToFavorite: () => {},
  onAddToCart: () => {},
  setCartOpened: () => {},
  setCartItems: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  onRemoveItem: () => {},
  currentUser: null,
  handleLogin: () => {},
  handleRegister: () => {},
  handleLogout: () => {},
  filters: {},
  setFilters: () => {},
  sortByPrice: "default",
  setSortByPrice: () => {},
})

export default AppContext
