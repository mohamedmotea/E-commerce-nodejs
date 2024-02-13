import { Schema, model } from "mongoose"


const category_schema = new Schema({
  name:{
    type:String,
    unique:true,
    required:true,
    minLength:1,
    maxLength:255,
    trim:true
  },
  slug:{
    type:String,
    unique:true,
    required:true,
    trim:true
  },
  image:{ 
  secure_url:{type:String, required:true},
  public_id:{type:String, required:true,unique:true}
  },
  folderId:{type:String, required:true,unique:true},
  addedBy:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  updatedBy:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
},{timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}   
})

category_schema.virtual('subcategories',{
  ref:'SubCategory',
  localField:'_id',
  foreignField:'categoryId'
})

const Category = model('Category', category_schema)

export default Category