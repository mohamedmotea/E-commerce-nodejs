

export const checkProductInCart = (cart,productId)=>{

  return  cart.products.some((product)=> product.productId == productId)

}