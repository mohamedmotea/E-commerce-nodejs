import Cart from "../../../../DB/Models/cart.model.js"


export const addCart = async(userId,product,quantity,req)=>{
  const newCart = new Cart({
    userId,
    products:[
      {
        productId:product._id,
        quantity,
        title:product.title,
        basePrice:product.appliedPrice,
        finalPrice:product.appliedPrice * quantity
      }
    ],
    subTotal:product.appliedPrice * quantity
  })
  // save cart in database
  await newCart.save()

}