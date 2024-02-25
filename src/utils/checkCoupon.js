
import { DateTime } from 'luxon';
import Coupon from './../../DB/Models/coupon.model.js';
import CouponUsers from '../../DB/Models/coupon-users.model.js';


const checkCoupon = async (couponCode,userId)=>{
  // get this coupon
  const coupon = await Coupon.findOne({couponCode})
  // check if coupon vaild
  if(!coupon) return {message:'coupon not found',status:404}
  // check is coupon vaild
  if(coupon.couponStatus == 'expired' || DateTime.fromISO(coupon.toDate) < DateTime.now()) return {message:'expired coupon',status:400}
  // check is coupon stated
  if(DateTime.fromISO(coupon.fromDate) > DateTime.now()) return {message:'coupon not stated yet',status:400}
  // check user allowed this coupon
  const checkAllowed = await CouponUsers.findOne({couponId:coupon._id,userId})
  if(!checkAllowed) return {message:'this Coupon not for user account',status:403}
  // check usage coupon
  if(checkAllowed.maxUsage <= checkAllowed.usage) return {message:'you have exceed the usage coupon code',status:400} 

  return {coupon,checkAllowed}
}

export default checkCoupon;