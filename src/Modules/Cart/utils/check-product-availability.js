import Product from "../../../../DB/Models/product.model.js"


export const checkProductAvailabilty = async(productId,quantity)=>{
  // get Product by productId
  const product = await Product.findById(productId);
  // check quantity and Product availability
  if(!product || product.stock < quantity) return null;
  return product;
}