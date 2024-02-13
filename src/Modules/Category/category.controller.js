
import slugify from 'slugify';
import Category from './../../../DB/Models/category.model.js';
import uniqueString from './../../utils/generate-unique-string.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import SubCategory from './../../../DB/Models/sub-category.model.js';
import Brand from '../../../DB/Models/brand.model.js';
import Product from '../../../DB/Models/product.model.js';

export const addCategory = async (req,res,next)=>{
  // destructuring the request body
  const {name} = req.body
  // destructure user id
  const addedBy = req.user.id
  // check upload image
  if(!req.file) return next (new Error('upload image required',{cause:404}));
  // check category name exist
  const checkName = await Category.findOne({name})
  if(checkName) return next(new Error('Category name is already exist',{cause:409}));
  // create slug from slugify
  const slug = slugify(name)
  // create unique folder for this category
  const folderId = uniqueString(4)
  // uploud image in cloudinary 
  const {secure_url,public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
    folder: `${process.env.MAIN_FOLDER}/categories/${folderId}`
  })
  req.folder = `${process.env.MAIN_FOLDER}/categories/${folderId}`

  // create new category
  const newCategory = new Category({
    name,
    slug,
    image:{secure_url,public_id},
    folderId,
    addedBy,
  })
  // save new category
  await newCategory.save()
  req.savedDocument = {model:Category,_id: newCategory._id}

  res.status(201).json({
    message:'Category added successfully',
    data:newCategory
  })
}


export const updateCategory = async (req,res,next)=>{
  // destructuring the request params
  const {categoryId} = req.params
  // destructuring the request body
  const {name,oldPublic_id} = req.body
  // get category 
  const category = await Category.findById(categoryId)
  if(!category) return next(new Error('Category not found',{cause:404}))

  if(name) {
    // check name equal name
    if(name == category.name) return next(new Error('Category name is not changed',{cause:400}))
    
    // check category name exist
    const checkName = await Category.findOne({name})
    if(checkName) return next(new Error('Category name is already exist',{cause:409}))
    // create slug from slugify
    const slug = slugify(name)
    category.name = name
    category.slug = slug
  
  }

  // if user uploud image
  if(oldPublic_id){
    if(!req.file) return next(new Error('File not found',{cause:404}))
    const newPublic_id = oldPublic_id.split(`${category.folderId}/`)[1]
    // uploud image
    const {secure_url,public_id} = await cloudinaryConnection().uploader.upload(req.file.path,{
      folder: `${process.env.MAIN_FOLDER}/categories/${category.folderId}`,
      public_id:newPublic_id
    })
    // save image in database
    category.image = {secure_url,public_id}    
  }

  category.updatedBy = req.user.id
  await category.save()

  res.status(200).json({
    message:'Category updated successfully',
    data:category
  })

}

export const deleteCategory = async (req,res,next)=>{
  // destructure data from request body & params
  const {categoryId} = req.params
  // get category 
  const category = await Category.findOneAndDelete({_id:categoryId,addedBy:req.user.id}).populate('subcategories')
  if(!category) return next(new Error('Category not found',{cause:404}))
  // delete all subcategories & brands & products linked to this category 
  await SubCategory.deleteMany({categoryId})
  await Brand.deleteMany({categoryId})
  await Product.deleteMany({categoryId})
  // delete all images for subcategories & brands linked to this category
  await cloudinaryConnection().api.delete_resources_by_prefix(`${process/env.MAIN_FOLDER}/categories/${category.folderId}`)
  await cloudinaryConnection().api.delete_folder(`${process/env.MAIN_FOLDER}/categories/${category.folderId}`)
  res.status(200).json({
    message:'Category deleted successfully',
    data:category
  })
}

export const getAllCategories = async (req,res,next)=>{
  const categories = await Category.find().populate([{path:'subcategories',populate:'brands'}])
  res.status(200).json({
    message:'Categories fetched successfully',
    data:categories
  })
}

export const getSingleCategory = async (req,res,next)=>{
  const {categoryId} = req.params
  const category = await Category.findById(categoryId).populate([{path:'subcategories',populate:'brands'}])
  if(!category) return next(new Error('Category not found',{cause:404}))
  res.status(200).json({
    message:'Category fetched successfully',
    data:category
  })
}
