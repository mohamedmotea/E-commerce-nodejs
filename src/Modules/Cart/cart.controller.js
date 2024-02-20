import Cart from './../../../DB/Models/cart.model.js';
import { checkProductAvailabilty } from './utils/check-product-availability.js';
import { checkUserCart } from './utils/get-user-cart.js';
import { addCart } from './utils/add-cart.js';
import { updateProductQuantity } from './utils/update-product-quantitiy.js';
import { addNewProduct } from './utils/add-new-product.js';
import { calcSupTotal } from './utils/calc-supTotal.js';

export const addProductToCart = async (req,res,next)=>{
  // destructuring required data from request body
  const {quantity,productId} = req.body;
  // destructuring user data from authorization
  const {id} = req.user
  // get product availability 
  const product = await checkProductAvailabilty(productId,quantity)
  if(!product) return next(new Error('Product not available',{cause:400}));
  // check user have cart
  const userCart = await checkUserCart(id)
  // if user don`t have cart
  if(!userCart){
    // create a new Cart
  const newCart = await addCart(id,product,quantity,req)
    res.status(201).json({
      message:'cart created successfully',
      data:newCart
    })
  }
  // check if product is already in cart 
  const updateProduct = await updateProductQuantity(userCart,productId,quantity)
  // if product is not in cart
  if(!updateProduct){
    const addProduct =  await addNewProduct(userCart,product,quantity,id)
    if(!addProduct) return next(new Error('Product not available',{cause:400}))
  }
  res.status(201).json({
    message:'cart updated successfully',
    data:userCart
  })

}

export const removeProductFromCart = async(req,res,next)=>{
  // destructuring required data from request body
  const {productId} = req.params;
  // destructuring user data from authorization
  const {id} = req.user
  // get product->Cart
  const userCart = await Cart.findOne({userId:id, 'products.productId':productId})
  if(!userCart) return next(new Error('product not found in cart',{cause:404}))
  // remove product from cart
  userCart.products = userCart.products.filter((product)=> product.productId != productId)
  // update subTotal
  userCart.subTotal = calcSupTotal(userCart.products)
  // save new data in Cart
  const newCart = await userCart.save()
  // check if cart Empty
  if(!newCart.products.length){ await Cart.deleteOne({_id:newCart._id})}
  res.status(200).json({
    message:'cart updated successfully',
    data:newCart
  })
}