import Cart from "../../../../DB/Models/cart.model.js"

export const checkUserCart = async(userId)=>{
  const cart = await Cart.findOne({userId})
  return cart
}