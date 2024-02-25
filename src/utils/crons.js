import { scheduleJob } from "node-schedule";
import Coupon from "../../DB/Models/coupon.model.js";
import { DateTime } from "luxon";


export function verifyCouponVaild(){
  scheduleJob('59 59 */23 * * *',async()=>{
    const coupons = await Coupon.find({couponStatus:'valid'})
    for(const coupon of coupons){
      if(DateTime.now() > DateTime.fromISO(coupon.toDate)){
        coupon.couponStatus = 'expired';
        await coupon.save()
      }
    }
  })
}