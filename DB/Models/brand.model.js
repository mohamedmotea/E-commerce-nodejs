import { Schema ,model} from "mongoose";


const brand_schema = new Schema({
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
  logo:{
    secure_url:{type:String, required:true},
    public_id:{type:String, required:true,unique:true}
  },
  folderId:{type:String, required:true,unique:true},
  addedBy:{type:Schema.Types.ObjectId,ref:'User',required:true},
  updatedBy:{type:Schema.Types.ObjectId,ref:'User' },
  subCategoryId:{type:Schema.Types.ObjectId,ref:'SubCategory',required:true},
  categoryId:{type:Schema.Types.ObjectId,ref:'Category',required:true}

},{timestamps:true})

const Brand = model('Brand', brand_schema)

export default Brand