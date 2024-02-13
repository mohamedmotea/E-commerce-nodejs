import User from './../../../DB/Models/user.model.js';

export const getUserData = async(req, res, next) =>{
  // desturture user data from authenticated
  const {id} = req.user
  // get user data from database
  const user = await User.findById(id).select('-password -isEmailVerified -isLoggedIn');
  if(!user) return next(new Error('user not found',{cause:404}))
  return res.status(200).json({message:'user data',data:user})
}