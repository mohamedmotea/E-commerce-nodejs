import slugify from "slugify";
import Brand from "../../../DB/Models/brand.model.js";
import SubCategory from './../../../DB/Models/sub-category.model.js';
import uniqueString from './../../utils/generate-unique-string.js';
import cloudinaryConnection from './../../utils/cloudinary.js';
import Product from './../../../DB/Models/product.model.js';


export const addBrand = async (req,res,next)=>{
  // destructure data from request body
  const {name} = req.body
  // destructure data from request query
  const {subCategoryId,categoryId} = req.query
  // destructure user id
  const {id} = req.user
  // check upload image
  if(!req.file) return next (new Error('upload image required',{cause:404}));
  // check category name exist
  const checkName = await Brand.findOne({name})
  if(checkName) return next(new Error('Brand name is already exist',{cause:409}));
  // check category & subcategory
  const subCategory = await SubCategory.findById(subCategoryId).populate('categoryId')
  if(!subCategory) return next(new Error('SubCategory not found',{cause:404}))
  // check category
  if(categoryId != subCategory.categoryId._id) return next(new Error('category id incorrect',{cause:400}))
  // generate unique folder for this brand
  const folderId = uniqueString(4)
  // uploud image in cloudinary 
  const {secure_url,public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
    folder: `${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/subCategories/${subCategory.folderId}/brands/${folderId}`
  })
  req.folder =  `${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/subCategories/${subCategory.folderId}/brands/${folderId}`
  // create slug from slugify
  const slug = slugify(name)
  // create new brand
  const newBrand = new Brand({
    name,
    slug,
    logo:{secure_url,public_id},
    folderId,
    addedBy:id,
    subCategoryId,
    categoryId
  })
  // save new brand
  await newBrand.save()
  req.saveDocument = {model:Brand,_id:newBrand._id}
  return res.status(201).json({
    message:'brand added successfully',
    data:newBrand
  })
}

export const updateBrand = async (req,res,next)=>{
  // destructure data from request body
  const {name,subCategoryId,categoryId,oldPublic_id} = req.body
  // destructure data from request params
  const {brandId} = req.params
  // destructure user id
  const {id} = req.user
  // get this brand
  const brand = await Brand.findOne({_id: brandId,addedBy:id,categoryId,subCategoryId}).populate([{path:'categoryId'},{path:'subCategoryId'}])
  if(!brand) return next(new Error('brand not found',{cause:404}))
  // check category name exist
  const checkName = await Brand.findOne({name})
  if(checkName) return next(new Error('Brand name is already exist',{cause:409}));

  if(name){
    // check if name already equal old name
    if(brand.name == name) return next(new Error('brand name equel brand name',{cause:409}))
    brand.name = name
    brand.slug = slugify(name)
  } 
  if(oldPublic_id){
    if(!req.file) return next(new Error('file not found',{cause:404}))
    const newPublic_id = oldPublic_id.split(`${brand.folderId}/`)[1]
    const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path,{
      folder: `${process.env.MAIN_FOLDER}/categories/${brand.categoryId.folderId}/subCategories/${brand.subCategoryId.folderId}/brands/${brand.folderId}`,
      public_id:newPublic_id
    })
    brand.logo.secure_url = secure_url
  }
  await brand.save()

  return res.status(200).json({
    message:'brand updated successfully',
    data:brand
  })

}

export const getAllBrands = async (req,res,next)=>{
  const brands = await Brand.find().populate([{path: 'categoryId'},{path: 'subCategoryId'}])
  res.status(200).json({
    message:'brands fetched successfully',
    data:brands
  })
}
export const getSingleBrand = async (req,res,next)=>{
  // destructure data from request params
  const {brandId} = req.params
  // get brand by ID and subcategory & category linked the brand
  const brand = await Brand.findById(brandId).populate([{path: 'categoryId'},{path: 'subCategoryId'}])
  if(!brand) return next(new Error('brand not found',{cause:404}))
  res.status(200).json({
    message:'brand fetched successfully',
    data:brand
  })
}

export const deleteBrand = async (req,res,next)=> {
  // destructure data from request params
  const {brandId} = req.params
  // delete brand by ID
  const brand = await Brand.findByIdAndDelete(brandId)
  if(!brand) return next(new Error('brand not found',{cause:404}))
  // delete all products linked to the brand
  await Product.deleteMany({brandId})
  // delete all images linked to the brand
  await cloudinaryConnection().api.delete_resources_by_prefix(`${brand.folderId}`)
  await cloudinaryConnection().api.delete_folder(`${brand.folderId}`)
  return res.status(200).json({
    message:'brand deleted successfully',
    data:brand
  })
}