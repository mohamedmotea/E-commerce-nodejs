import { Schema, model } from "mongoose";


const subCategory_schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique:true
  },
  image:{  secure_url:{type:String, required:true},
  public_id:{type:String, required:true,unique:true}},
  folderId:{type:String, required:true,unique:true},
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy:{
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
},{timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  })

subCategory_schema.virtual('brands',{
  ref:'Brand',
  localField:'_id',
  foreignField:'subCategoryId'
})  

const SubCategory = model('SubCategory',subCategory_schema)

export default SubCategory