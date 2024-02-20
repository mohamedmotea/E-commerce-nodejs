import { calcSupTotal } from "./calc-supTotal.js"


export const addNewProduct = async (cart,product,quantity,userId)=>{
  cart.products.push({
    productId:product._id,
    userId,
    quantity,
    title:product.title,
    basePrice:product.appliedPrice,
    finalPrice:product.appliedPrice * quantity
  })


  cart.subTotal =   calcSupTotal(cart.products)
  return await cart.save()
}