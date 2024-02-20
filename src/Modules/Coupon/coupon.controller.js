
import CouponUsers from '../../../DB/Models/coupon-users.model.js';
import User from '../../../DB/Models/user.model.js';
import { rule } from '../../utils/systemRule.js';
import Coupon from './../../../DB/Models/coupon.model.js';
import ApiFeatures from './../../utils/api-features.js';

export const addCoupon = async (req,res,next)=>{
  // destructuing the required data from request body
  const {couponCode, couponAmount, isFixed = false,isPercentage = false,fromDate,toDate,users} = req.body;
  // destructuring the user data
  const {id:addedBy} = req.user;
  // check if coupon is already exist
  const checkCoupon = await Coupon.findOne({couponCode})
  if(checkCoupon) return next(new Error('Coupon Code is already exist',{cause:409}))
  // check isFixed || isPrecentage
  if(isFixed == isPercentage) return next(new Error('Coupon can be either fixed or percentage',{cause:400}))
  // check percentage value - couponAmount
  if(isPercentage) if(couponAmount > 100) return next(new Error('Percentage should be less than 100',{cause:400}))
  // create new Coupon
  const coupon = new Coupon({
    couponCode,
    couponAmount,
    isFixed,
    isPercentage,
    fromDate,
    toDate,
    addedBy
  })
  // save Coupon in database
  await coupon.save()
  // check users vaild
  let usersIds = []
  for(const user of users){usersIds.push(user.userId)}
  const checkUsers = await User.find({_id:{$in:usersIds}})
  if(checkUsers.length != users.length) {
    await Coupon.deleteOne({_id:coupon._id})
    return next(new Error('user not found',{cause:404}))
  }
  // users allowed to use this coupon
  const allowedUsers = await CouponUsers.create(users.map((user) => ({...user,couponId:coupon._id})))
  // delete coupon in fail case
  req.saveDocument = {model:Coupon,_id:coupon._id}
  res.status(201).json({message:'coupon created successfully',coupon,allowedFor:allowedUsers})
}

export const updateCoupon = async (req,res,next) =>{
  // destructuring the required data from request body
  const {couponCode, couponAmount, isFixed, isPercentage,fromDate,toDate,oldUserIds,newUsers} = req.body;
  // destructuring the required data from request params
  const {couponId} = req.params
  // destructuring the user data
  const {id:updatedBy} = req.user;
  // get coupon
  const coupon = await Coupon.findById(couponId)
  // check if coupon vaild
  if(!coupon) return next(new Error('coupon not found',{cause:404}))
  // check if coupon Code is already exist
  const checkCoupon = await Coupon.findOne({couponCode})
  if(checkCoupon) return next(new Error('Coupon Code is already exist',{cause:409}))
  // handle isPercentage and isFixed value
  if(isPercentage && isFixed) return next(new Error('Coupon can be either percentage or fixed',{cause:409}))
  // handle percentage
if(isPercentage) {
  if((couponAmount > 100) || coupon.couponAmount > 100) return next(new Error('Percentage should be less than 100',{cause:400}))
  coupon.isPercentage = isPercentage 
coupon.isFixed = !isPercentage
}
// handle fixed
if(isFixed) {
  coupon.isFixed = isFixed
  coupon.isPercentage = !isFixed
}
// update items
if(fromDate) coupon.fromDate = fromDate
if(toDate) coupon.toDate = toDate
if(couponAmount) coupon.couponAmount = couponAmount
// remove users from couponUsers list
if(oldUserIds) {
  const removeUsersCoupon = await CouponUsers.find({userId:{$in:oldUserIds},couponId})
  if(oldUserIds.length != removeUsersCoupon.length) return next(new Error('user not found for remove',{cause:404}))
  await CouponUsers.deleteMany({userId:{$in:oldUserIds},couponId})
}
// add new users to couponUsers list
  let newUsersIds = []
  if(newUsers){
    for(const user of newUsers){newUsersIds.push(user.userId)}  }
  if(newUsersIds.length){
    const checkUsers = await User.find({_id:{$in:newUsersIds}})
    const checkUsersCoupon = await CouponUsers.find({userId:{$in:newUsersIds},couponId})
    if(checkUsersCoupon.length) return next(new Error('user already have this coupon',{cause:409}))
    if(checkUsers.length != newUsers.length) {return next(new Error('user not found to allow coupon',{cause:404}))}
     await CouponUsers.create(newUsers.map((user) => ({...user,couponId:coupon._id})))
  }
  coupon.updatedBy = updatedBy
  await coupon.save()
  res.status(200).json({message:'coupon updated successfully',success:true,data:coupon})
}

export const deleteCoupon = async (req,res,next)=>{
  // destructuring the required data from request params
  const {couponId} = req.params
  // destructuring the required data from user authorization
  const {role ,id } = req.user
  // get coupon
  const coupon = await Coupon.findById(couponId)
  // check if coupon vaild
  if(!coupon) return next(new Error('coupon not found',{cause:404}))
  if(role != rule.SUPERADMIN || id != coupon.addedBy) return next(new Error('unauthorized',{cause:403}))
  // delete coupon
  await Coupon.deleteOne({_id:couponId})
  res.status(200).json({message:'coupon deleted successfully',success:true})
}

export const getAllCoupons = async (req,res,next)=>{
  const {page,size,sort} = req.query
  const apiFeatures = new ApiFeatures(req.query,Coupon.find()).pagination({page,size}).sort(sort)
  const coupons = await apiFeatures.mongooseQuery
  res.status(200).json({
    message:'coupons fetched successfully',
    data:coupons
  })
}

export const getSingleCoupon = async (req,res,next)=>{
  // destructuring the required data from request params
  const {couponId} = req.params
  // get coupon with users
  const coupon = await Coupon.findById(couponId).populate('users')
  if(!coupon) return next(new Error('coupon not found',{cause:404}))
  res.status(200).json({
    message:'coupon fetched successfully',
    data:coupon
  })
}