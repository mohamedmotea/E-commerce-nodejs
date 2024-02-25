import slugify from 'slugify';
import SubCategory from '../../../DB/Models/sub-category.model.js';
import Category from './../../../DB/Models/category.model.js';
import uniqueString from './../../utils/generate-unique-string.js';
import cloudinaryConnection from './../../utils/cloudinary.js';
import Brand from './../../../DB/Models/brand.model.js';
import Product from './../../../DB/Models/product.model.js';
import ApiFeatures from './../../utils/api-features.js';

export const addSubCategory = async (req,res,next)=>{
  // destructure data from request body
  const {name} = req.body
  // destructure user id
  const addedBy = req.user.id
  // destructure categoryId
  const {categoryId} = req.params
  // this category
  const category = await Category.findById(categoryId)
  if(!category) return next(new Error('Category not found',{cause:404}))
  // check upload image
  if(!req.file) return next (new Error('upload image required',{cause:404}));
  // check subcategory name exist
  const checkName = await SubCategory.findOne({name})
  if(checkName) return next(new Error('subcategory name is already exist',{cause:409}));
  // create slug from slugify
  const slug = slugify(name)
  // create unique folder for this subcategory
  const folderId = uniqueString(5)
  // uploud image in cloudinary 
  const {secure_url,public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
    folder: `${process.env.MAIN_FOLDER}/categories/${category.folderId}/subCategories/${folderId}`
  })
  req.folder = `${process.env.MAIN_FOLDER}/categories/${category.folderId}/subCategories/${folderId}`

  // create new subcategory
  const newSubCategory = new SubCategory({
    name,
    slug,
    image:{secure_url,public_id},
    folderId,
    addedBy,
    categoryId
  })
  // save new subcategory
  await newSubCategory.save()
  req.saveDocument = {model:SubCategory,_id : newSubCategory._id}

  res.status(201).json({
    message:'subcategory added successfully',
    data:newSubCategory
  })
}


export const updateSubCategory = async (req,res,next)=>{
  // destructure data from request body & params
  const {subCategoryId} = req.params
  const {name,oldPublic_id} = req.body
  // get category 
  const subCategory = await SubCategory.findById(subCategoryId).populate('categoryId')
  if(!subCategory) return next(new Error('subCategory not found',{cause:404}))
  if(name) {
    // check name equal name
    if(name == subCategory.name) return next(new Error('subCategory name is not changed',{cause:400}))
    
    // check category name exist
    const checkName = await SubCategory.findOne({name})
    if(checkName) return next(new Error('subCategory name is already exist',{cause:409}))
    // create slug from slugify
    const slug = slugify(name)
    subCategory.name = name
    subCategory.slug = slug
  }
  // if user uploud image
  if(oldPublic_id){
    const newPublic_id = oldPublic_id.split(`${subCategory.folderId}/`)[1]
    // uploud image
    const {secure_url,public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
      folder: `${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/subCategories/${subCategory.folderId}`,
      public_id:newPublic_id
    })
    // save image in database
    subCategory.image = {secure_url,public_id}
    
  }

    subCategory.updatedBy = req.user.id
    await subCategory.save()

    res.status(200).json({
      message:'subCategory updated successfully',
      data:subCategory
    })

}

export const getAllSubCategories = async (req, res,next) => {
  // destructuring required data from request query
  const {page,size,sort,...search} = req.query
  const features = new ApiFeatures(req.query,SubCategory.find().populate([{path:'categoryId'},{path:'brands'}])).pagination({page,size}).sort(sort).search(search).filter(search)
  const subCategories = await features.mongooseQuery
  res.status(200).json({
    message:'subCategories fetched successfully',
    data:subCategories
  })
}

export const getSingleSubCategory = async (req, res, next) => {
  const {subCategoryId} = req.params
  const subCategory = await SubCategory.findById(subCategoryId).populate([{path:'categoryId'},{path:'brands'}])
  if(!subCategory) return next(new Error('subCategory not found',{cause:404}))
  res.status(200).json({
    message:`subCategory ${subCategory.name} fetched successfully`,
    data:subCategory
  })
}

export const deleteSubCategory = async (req, res, next) => {
  const {subCategoryId} = req.params
  const subCategory = await SubCategory.findByIdAndDelete(subCategoryId)
  if(!subCategory) return next(new Error('subCategory not found',{cause:404}))
  await Brand.deleteMany({subCategoryId})
  await Product.deleteMany({subCategoryId})
// delete all images linked to subCategory
  await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/subCategories/${subCategory.folderId}`)
  await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/categories/${subCategory.categoryId.folderId}/subCategories/${subCategory.folderId}`)

  res.status(200).json({
    message:'subCategory deleted successfully',
    data:subCategory
  })
}