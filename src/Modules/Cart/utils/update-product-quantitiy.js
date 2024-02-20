
import { calcSupTotal } from './calc-supTotal.js';
import {  checkProductInCart } from './check-product-in-cart.js';

export const updateProductQuantity = async(cart,productId, quantity) =>{
  const checkProduct = checkProductInCart(cart,productId, quantity)
  if(!checkProduct) return null

  for(const product of cart.products){
    if(product.productId == productId){
      product.quantity = quantity
      product.finalPrice = product.basePrice * quantity
    }
  }

  cart.subTotal =  calcSupTotal(cart.products)
  return await cart.save()
}