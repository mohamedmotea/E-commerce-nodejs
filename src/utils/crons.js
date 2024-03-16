import { scheduleJob } from "node-schedule";
import Coupon from "../../DB/Models/coupon.model.js";
import { DateTime } from "luxon";
import Order from "../../DB/Models/order.model.js";
import { orderstatus } from "./systemRule.js";


export function verifyCouponVaild(){
  scheduleJob('* * 0 * * *',async()=>{
    const coupons = await Coupon.find({couponStatus:'valid'})
    for(const coupon of coupons){
      if(DateTime.now() > DateTime.fromISO(coupon.toDate)){
        coupon.couponStatus = 'expired';
        await coupon.save()
      }
    }
  })
}

export function cancelledOrder(){
  scheduleJob('* * 0 * * *',async()=>{
    const orders = await Order.find({createdAt:{$lt:DateTime.now().toFormat('yyyy-M-dd')},cancelledAt:null,isPaid:false,isDelivered:false})
    for(const order of orders){
      order.cancelledAt = DateTime.now().toFormat('yyyy-M-dd hh:mm:ss')
      order.orderStatus = orderstatus.CANCELLED
      await order.save()
    }
  })
}