import { Schema, model } from "mongoose";

const cart_schema = new Schema({
  userId :{
    type: Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  products:[
    {
      productId:{
        type: Schema.Types.ObjectId,
        ref: "Product",
        required:true
      },
      quantity:{
        type: Number,
        required:true,
        default:1
      },
      basePrice:{
        type: Number,
        required:true,
        default:0
      },
      finalPrice:{
        type: Number,
        required:true,
        default:0
      },
      title:{
        type: String,
        required:true
      }
    }
  ],
  subTotal:{
    type: Number,
    required:true,
    default:0
  }
},{timestamps:true})

const Cart = model('Cart', cart_schema)

export default Cart