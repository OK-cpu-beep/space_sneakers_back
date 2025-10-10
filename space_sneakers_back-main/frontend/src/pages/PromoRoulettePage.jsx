import React from "react"
import PromoRoulette from "../components/PromoRoulette"

function PromoRoulettePage() {
  return (
    <div className="content p-40">
      <div className="d-flex align-center justify-between mb-40">
        <h1>Рулетка промокодов</h1>
      </div>
      <PromoRoulette />
    </div>
  )
}

export default PromoRoulettePage
