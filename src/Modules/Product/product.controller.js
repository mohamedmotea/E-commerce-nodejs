import slugify from "slugify";
import Product from "../../../DB/Models/product.model.js";
import { rule } from "../../utils/systemRule.js";
import Brand from './../../../DB/Models/brand.model.js';
import cloudinaryConnection from './../../utils/cloudinary.js';
import uniqueString from './../../utils/generate-unique-string.js';
import ApiFeatures from "../../utils/api-features.js";
import Io from "../../utils/socketIo.js";

export const addProduct = async (req, res, next) => {
  // destructuring the request body
  const {
    title,
    desc,
    basePrice,
    discount,
    stock,
    specs 
  } = req.body;
  // destructuring the request query
  const { categoryId,subCategoryId,brandId } = req.query;
  // destructuring the user id
  const { id ,role} = req.user;
  // check upload images
  if (!req.files) return next(new Error("upload image required", { cause: 404 }));
  // Check Brand
  const brand = await Brand.findById(brandId);
  if (!brand) return next(new Error("brand not found", { cause: 404 }));
  // check category
  if(categoryId != brand.categoryId) return next(new Error('category not found',{cause:404}))
    // check subCategory
  if(subCategoryId != brand.subCategoryId) return next(new Error('subCategory not found',{cause:404}))
  // check authorization
  if(role != rule.SUPERADMIN && id != brand.addedBy ) return next(new Error('Unauthorized',{cause:401}))
  // create Slug 
  const slug = slugify(title,{lower:true});
  // create applied Price
  const appliedPrice = basePrice - (basePrice * ((discount || 0) / 100))
  // create unique folder for this product
  const folderId = uniqueString(4)
  // get file path
  const folder = brand.logo.public_id.split(`${brand.folderId}/`)[0]
  // array of images
  let Images = []
  // uploud images in cloudinary
  for(const file of req.files){
    const {secure_url,public_id} = await cloudinaryConnection().uploader.upload(file.path,{
      folder: `${folder}/${brand.folderId}/products/${folderId}`
    })
    Images.push({secure_url,public_id} )
  }
  req.folder = `${folder}/${brand.folderId}/products/${folderId}`
  // create product
  const product = new Product({
    title,
    slug,
    desc,
    folderId,
    basePrice,
    discount,
    appliedPrice,
    stock,
    addedBy:id,
    brandId,
    categoryId,
    subCategoryId,
    Images,
    specs:JSON.parse(specs)
  })
  // save product in database
  await product.save()
  // socket.io new Product
  Io().emit('newProduct',{product})
  req.saveDocument = {model:Product,_id:product._id}
   res.status(201).json({
    message:'product added successfully',
    data:product
  })
};

export const updateProduct = async (req, res, next) => {
  // destructuing data for update 
  const {title,desc,stock,discount,basePrice,specs,oldPublic_id} = req.body;
  // destructuing product ID from request params
  const {productId} = req.params
  // destructuring user data from authorization
  const {id , role} = req.user
  // get product
  const product = await Product.findById(productId)
  if(!product) return next(new Error('product not found',{cause:404}))
  // check authorization
  if(role != rule.SUPERADMIN && id != product.addedBy ) return next(new Error('Unauthorized to update this product',{cause:401}))
  // update product
  if(title) {
    product.title = title
    product.slug = slugify(title,{lower:true})}
  if(desc) product.desc = desc
  if(stock) product.stock = stock
  if(discount) product.discount = discount
  if(basePrice) product.basePrice = basePrice
  if(specs) product.specs = JSON.parse(specs)
  const appliedPrice = (basePrice || product.basePrice ) * (1 - ((discount || product.discount) / 100))
  product.appliedPrice = appliedPrice
  // update image in cloudinary
  if(oldPublic_id){
    if(!req.file) return next(new Error('File not found',{cause:404}))
    const newPublicId = oldPublic_id.split(`${product.folderId}/`)[1]
    const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
        folder: `${oldPublic_id.split(`${product.folderId}/`)[0]}${product.folderId}`,
        public_id:newPublicId
    })
    product.Images.map((img)=> {
      if(img.public_id == oldPublic_id){
          img.secure_url = secure_url  
      }
    })
  }
  // save product in database
  await product.save()
  res.status(201).json({
    message:'product updated successfully',
    data:product
  })
}
export const getSingleProduct = async (req, res,next) => {
  const {productId} = req.params
  const product = await Product.findById(productId).populate([{path: 'brandId'},{path: 'categoryId'},{path:'subCategoryId'},{path:'addedBy',select:'username'},{path:'reviews',populate:{path:'userId',select:'username'}}])
  if(!product) return next(new Error('Product not found',{cause:404}))
  res.status(200).json({
  message:'product fetched successfully',
  data:product
  })
}

export const deleteProduct = async (req, res, next) => {
  const {productId} = req.params
  // destructuring the user id
  const { id ,role} = req.user;
  const product = await Product.findById(productId)
  if(!product) return next(new Error('product not found',{cause:404}))
  // check authorization
if(role != rule.SUPERADMIN && id != product.addedBy ) return next(new Error('Unauthorized To Delete This Product',{cause:401}))
const dltProduct = await Product.findByIdAndDelete(productId)
res.status(200).json({
  message:'product deleted successfully',
  data:dltProduct
})
}

export const getAllProducts = async (req, res) => {
  const {page , size , sort,...search} = req.query
  const feature = new ApiFeatures(req.query,Product.find().populate([{path: 'brandId'},{path: 'categoryId'},{path:'subCategoryId'},{path:'addedBy',select:'username'},{path:'reviews',populate:{path:'userId',select:'username'}}])).pagination({page,size}).sort(sort).search(search).filter(search)
  const products = await feature.mongooseQuery
  res.status(200).json({
    message:'products fetched successfully',
    data:products
  })
}