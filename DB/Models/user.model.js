import { Schema, model } from "mongoose";
import { rule } from "../../src/utils/systemRule.js";


const user_schema = new Schema({
  username:{
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minLength:3,
    maxLength:20
  },
  email:{
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  password:{
    type: String,
    required: true,
    min:6
  },
  age:{
    type: Number,
    min:12,
    max:100
  },
  role:{
    type: String,
    enum:[rule.USER, rule.ADMIN,rule.SUPERADMIN],
    default: rule.USER
  },
  isEmailVerified:{
    type: Boolean,
    default: false
  },
  phoneNumbers:[{type: String,required: true}],
  addresses:[{type: String,required: true}],
  isLoggedIn:{
    type: Boolean,
    default: false
  }
},{timestamps: true})

const User =  model('User', user_schema)

export default User