import path from 'path'
import { DateTime } from "luxon";
import Order from "../../../DB/Models/order.model.js";
import checkCoupon from "../../utils/checkCoupon.js";
import { checkProductAvailabilty } from "./../Cart/utils/check-product-availability.js";
import Cart from './../../../DB/Models/cart.model.js';
import Product from "../../../DB/Models/product.model.js";
import * as systemRule from "../../utils/systemRule.js";
import generateQrCode from "../../utils/qrcode.js";
import createInvoice from "../../utils/pdfkit.js";
import uniqueString from './../../utils/generate-unique-string.js';
import sendEmailService from './../Services/send-emails.services.js';
import { confimedPaymentIntent, couponWithStripe, createCheckOutSession, createPaymentIntent } from './../../payment-handler/stripe.js';

export const createOrder = async (req, res, next) => {
  // destructuring the required data from request body
  const {
    couponCode,
    productId,
    quantity,
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    paymentMethod,
  } = req.body;
  // destructuring user data from authentiction
  const { id: userId ,username :name ,email} = req.user;
  // check coupon isValid
  const coupon = await checkCoupon(couponCode, userId);
  if (couponCode && coupon?.status)
    return next(new Error(coupon.message, { cause: coupon.status }));

  // check product aviliable
  const checkProduct = await checkProductAvailabilty(productId, quantity);
  if (!checkProduct)
    return next(new Error("product not available", { cause: 400 }));
  // handle orderItemes
  const orderItemes = [
    {
      productId,
      title: checkProduct.title,
      quantity,
      basePrice: checkProduct.basePrice,
      finalPrice:checkProduct.appliedPrice,
      discount:checkProduct.discount,
      totalPrice:checkProduct.appliedPrice * quantity
    },
  ];
  // handle phoneNumbers
  const phoneNumbers = [phone];
  // handle shippingAddress
  const shippingAddress =
    {
      address,
      city,
      state,
      country,
      zipCode,
    }
  // handle shippingPrice
  const shippingPrice = orderItemes[0].finalPrice * quantity;
  let totalPrice = shippingPrice;

  // handle orderstatus
  let orderStatus = systemRule.orderstatus.PENDING;
  if (paymentMethod == systemRule.paymentMethod.CASH)
    orderStatus = systemRule.orderstatus.PLACED;
  // handle coupon
  if (couponCode && coupon.coupon.isFixed) {
    if (coupon.coupon.couponAmount > shippingPrice)
      return next(
        new Error("this coupon not valid to this product", { cause: 400 })
      );
    totalPrice = shippingPrice - coupon.coupon.couponAmount;
    coupon.checkAllowed.usage += 1;
    coupon.checkAllowed.save();
  } else if (couponCode && coupon.coupon.isPercentage) {
    if (coupon.coupon.couponAmount > 100)
      return next(new Error("this coupon not valid to use", { cause: 400 }));
    totalPrice =
      shippingPrice - (shippingPrice * coupon.coupon.couponAmount) / 100;
    coupon.checkAllowed.usage += 1;
    coupon.checkAllowed.save();
  }
  // create new Order
  const order = new Order({
    userId,
    couponId: coupon?.coupon?._id,
    orderItemes,
    phoneNumbers,
    shippingAddress,
    shippingPrice,
    paymentMethod,
    orderStatus,
    totalPrice,
  });

  // handle stock
  checkProduct.stock -= quantity;
  // save in database
  await order.save();
  await checkProduct.save();

  // generate qr code
  const qrcode = await generateQrCode(order)
  // generate pdf reset
  const orderInvoice ={
    shipping:{
      name,
      address,
      city,
      state,
      country
    },
    items: [{
      title: checkProduct.title,
      quantity,
      discount:checkProduct.discount,
      basePrice: checkProduct.basePrice,
      finalPrice:checkProduct.appliedPrice,
      totalPrice:checkProduct.appliedPrice * quantity
    }],
    subTotal:order.shippingPrice,
    paidAmount:order.totalPrice,
    orderCode:userId,
    date:DateTime.now()
  }
  
  const orderCode = `${name}_${uniqueString(4)}.pdf`
   createInvoice(orderInvoice,orderCode)
   await sendEmailService({to:email,subject:'order from e-commerce',message:`
   <h1>New Order ..</h1>
   <p> please find your invoice pdf below </p>
   `, attachments:[{path: path.resolve(`Files/${orderCode}`)}]})
  res
    .status(201)
    .json({
      message: "order created successfully",
      data: order,
      success: true,
      qrcode,
    });
};

export const orderByCart = async (req, res, next) => {
  // destructuring the required data from request body
  const {
    couponCode,
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    paymentMethod,
  } = req.body;
  // destructuring user data from authentiction
  const { id: userId ,username:name ,email} = req.user;
  // get user Cart
  const cart = await Cart.findOne({userId}).populate('products.productId')

  if(!cart) return next (new Error('Cart not found',{cause:404}));
  // check coupon isValid
  const coupon = await checkCoupon(couponCode, userId);
  if (couponCode && coupon?.status) return next(new Error(coupon.message, { cause: coupon.status }));
  // handle orderItemes
  const orderItemes = cart.products.map((product)=>{
    return {
      productId:product.productId,
      title: product.title,
      quantity: product.quantity,
      basePrice: product.basePrice,
      finalPrice:product.finalPrice,
      discount:product.discount,
      totalPrice:product.totalPrice,
    }
  })
  // handle phoneNumbers
  const phoneNumbers = [phone];
  // handle shippingAddress
  const shippingAddress =  {
      address,
      city,
      state,
      country,
      zipCode,
    }
  
  // handle shippingPrice
  const shippingPrice = cart.subTotal;
  let totalPrice = shippingPrice;

  // handle orderstatus
  let orderStatus = systemRule.orderstatus.PENDING;
  if (paymentMethod == systemRule.paymentMethod.CASH)
    orderStatus = systemRule.orderstatus.PLACED;
  // handle coupon
  if (couponCode && coupon.coupon.isFixed) {
    if (coupon.coupon.couponAmount > shippingPrice)
      return next(
        new Error("this coupon not valid to this product", { cause: 400 })
      );
    totalPrice = shippingPrice - coupon.coupon.couponAmount;
    coupon.checkAllowed.usage += 1;
    coupon.checkAllowed.save();
  } else if (couponCode && coupon.coupon.isPercentage) {
    if (coupon.coupon.couponAmount > 100)
      return next(new Error("this coupon not valid to use", { cause: 400 }));
    totalPrice =
      shippingPrice - (shippingPrice * coupon.coupon.couponAmount) / 100;
    coupon.checkAllowed.usage += 1;
    coupon.checkAllowed.save();
  }
  // create new Order
  const order = new Order({
    userId,
    couponId: coupon?.coupon?._id,
    orderItemes,
    phoneNumbers,
    shippingAddress,
    shippingPrice,
    paymentMethod,
    orderStatus,
    totalPrice,
  });

  // handle stock
    for(const product of cart.products){
      await Product.updateOne({_id:product.productId},{$inc:{stock:-product.quantity}})
    }

    // delete cart
    await Cart.deleteOne({userId})
  // save in database
  await order.save();
   // generate pdf reset
   shippingAddress.name = name
  const orderInvoice ={
    shipping:shippingAddress,
    items:[...orderItemes],
    subTotal:cart.subTotal,
    paidAmount:order.totalPrice,
    orderCode:userId,
    date:DateTime.now()
  }
  const orderCode = `${name}_${uniqueString(4)}.pdf`
   createInvoice(orderInvoice,orderCode)
   await sendEmailService({to:email,subject:'order from e-commerce',message:`
   <h1>New Order ..</h1>
   <p> please find your invoice pdf below </p>
   `, attachments:[{path: path.resolve(`Files/${orderCode}`)}]})
  res
    .status(201)
    .json({
      message: "order created successfully",
      data: order,
      success: true,
    });
};

export const deliverOrder = async (req,res,next)=>{
  // destructuring order id from request params
  const {orderId} = req.params;
  // destructuring user data from authentiction
  const {id:deliveredBy} = req.user;
  // get order and update 
  const {PAID,PLACED,DELIVERED} = systemRule.orderstatus
  const order = await Order.findOneAndUpdate({_id:orderId,orderStatus:{$in:[PAID,PLACED]}}
    ,{orderStatus:DELIVERED,
     deliveredBy:deliveredBy,
    deliveredAt:DateTime.now().toFormat('yyyy-MM-dd hh:mm:ss'),
    isDelivered:true},
    {new:true})
  if(!order) return next(new Error('order delivered or not found',{cause:404}))
  res.status(200).json({message: 'Order updated successfully',data:order,success:true})
}

export const getOrders = async (req, res,next) => {
  // desturturing required data from authentication
  const {delivered,paid,placed} = req.query
  const {id:userId} = req.user;
  // obj get
  let arr = []
  if(delivered) arr.push (systemRule.orderstatus.DELIVERED )
  if(paid) arr.push (systemRule.orderstatus.PAID )
  if(placed) arr.push (systemRule.orderstatus.PLACED )
  if(arr.length == 0) {
    arr.push (systemRule.orderstatus.DELIVERED )
    arr.push (systemRule.orderstatus.PAID )
     arr.push (systemRule.orderstatus.PLACED )
  }
  const order = await Order.find({userId,orderStatus:{$in:arr}})
  res.status(200).json({message: 'Order fetched successfully',data:order})
}

export const cancelledOrder = async (req, res,next) => {
  // destructuring order id from request params
  const {orderId} = req.params;
  // destructuring user data from authentiction
  const {id:userId ,role} = req.user;
  // get order and update 
  const order = await Order.findById(orderId)
  if(!order) return next(new Error('order not found',{cause:404}))
  // check authorization 
  if(order.userId != userId && role != systemRule.rule.SUPERADMIN) return next(new Error('unauthorized to cancel this order',{cause:403}))
  // update order 
  order.orderStatus = systemRule.orderstatus.CANCELLED
  order.cancelledBy = userId
  order.isDelivered = false
  order.cancelledAt = DateTime.now().toFormat('yyyy-MM-dd hh:mm:ss')
  // save document in database
  await order.save()
  res.status(200).json({message: 'Order cancelled successfully',data:order,success:true})
}

export const getOrderData = async (req,res,next) =>{
  // destructuring order id from request params
  const {orderId} = req.params;
  const order = await Order.findById(orderId).populate([{path:'userId',select:'-password -__v'},{path:'cancelledBy',select:'-__v -password'},{path:'deliveredAt',select:'-__v -password'}])
  if(!order) return next(new Error('order not found',{cause:404}))
  res.status(200).json({message: 'Order fetched successfully',data:order})
}


// *********************** Payment ****************//

export const payWithStripe = async (req, res, next) => {
  // destructuring order id from request params
  const {orderId} = req.params;
  // destructuring user data from authentiction
  const {id:userId , email:customer_email} = req.user
  // get order data 
  const order = await Order.findOne({_id:orderId,userId,orderStatus :systemRule.orderstatus.PENDING})
  if(!order) return next(new Error('order not found',{cause:404}))

  const paymentArguments = {
    customer_email,
    discounts:[],
    metadata:{orderId:orderId.toString()},
    line_items:order.orderItemes.map((item)=>{
      return{
        price_data:{
          currency: 'EGP',
          product_data:{
            name:item.title
          },
          unit_amount:item.finalPrice * 100,
        },
        quantity:item.quantity
      }
    })
  }
  
  if(order.couponId){ 
    const stripeCoupon = await couponWithStripe(order.couponId)
    if(stripeCoupon.status) return next (new Error(stripeCoupon.message,{cause:stripeCoupon.status}))
    paymentArguments.discounts.push({coupon:stripeCoupon.id})
  }

  const payment = await createCheckOutSession(paymentArguments)
  const paymentIntent = await createPaymentIntent({amount:order.totalPrice})
  order.payment_method = paymentIntent.id
  await order.save()
  res.status(200).json({data:payment,paymentIntent})
}

// webhook local
export const webhookLocal = async (req, res ,next) => {
  const order = await Order.findById(req.body.data.object.metadata.orderId)
  if(!order) return next(new Error('order not found',{cause:404}))
  await confimedPaymentIntent({paymentIntentId:order.payment_method})
  order.orderStatus = systemRule.orderstatus.PAID,
  order.isPaid = true,
  order.paidAt = DateTime.now().toFormat('yyyy-MM-dd hh:mm:ss'),
  // save document in database
  order.save()
  res.status(200).json({message: 'webhook received successfully'})
}
// webhook host
export const webhook = async (req, res ,next) => {
  const sig = request.headers['stripe-signature'].toString();
  let event;

  try {
    event = stripe.webhooks.constructEvent(res.body, sig, process.env.WEBHOOK_SECRET_KEY);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      const order = await Order.findById(req.body.data.object.metadata.orderId)
      if(!order) return next(new Error('order not found',{cause:404}))
      await confimedPaymentIntent({paymentIntentId:order.payment_method})
      order.orderStatus = systemRule.orderstatus.PAID,
      order.isPaid = true,
      order.paidAt = DateTime.now().toFormat('yyyy-MM-dd hh:mm:ss'),
      // save document in database
      order.save()
      res.status(200).json({message: 'webhook received successfully'})
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }



}