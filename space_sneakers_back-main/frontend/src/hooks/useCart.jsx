import { useContext } from "react"
import AppContext from "../context"

export function useCart() {
  const { cartItems } = useContext(AppContext)
  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  )
  return { totalPrice }
}
