import { Schema, model } from "mongoose";

const product_schema = new Schema({
  // strings
  title:{type:String, required:true,trim:true,minLength:1,maxLength:255},
  slug:{type:String, required:true,trim:true},
  desc: String,
  folderId:{type:String, required:true},
  // numbers
  basePrice:{type:Number, required:true,min:0},
  discount:{type:Number,min:0,default:0},
  appliedPrice:{type:Number,required:true},
  stock:{type:Number,required:true,min:0,default:0},
  avgRating:{type:Number,min:0,max:5,default:0},
  // objectIds
  addedBy:{type:Schema.Types.ObjectId,required:true,ref:'User'},
  updatedBy:{type:Schema.Types.ObjectId,ref:'User'},
  brandId:{type:Schema.Types.ObjectId,required:true,ref:'Brand'},
  subCategoryId:{type:Schema.Types.ObjectId,required:true,ref:'SubCategory'},
  categoryId:{type:Schema.Types.ObjectId,required:true,ref:'Category'},
  // arrays
  Images:[{secure_url:{type:String,required:true},
     public_id:{type:String,required:true,unique:true}}],
  specs :{
    type:Map,
    of:[String || Number]
  }
},{timestamps: true})


const Product = model('Product',product_schema)

export default Product