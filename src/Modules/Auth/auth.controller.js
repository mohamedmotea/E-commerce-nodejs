import User from "../../../DB/Models/user.model.js"
import sendEmailService from "../Services/send-emails.services.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export const signUp = async (req,res,next)=>{
  // destructure the required data for request body
  const {username,email,password,age,role,phoneNumbers,addresses} = req.body
  // check if email is already exists in database
  const checkEmail = await User.findOne({email})
  if(checkEmail) return res.status(409).json({message: "Email already exists"})
  // email Token 
  const token = jwt.sign({email},process.env.VERIFICATION,{expiresIn: '1m'})
  // send email verification
  const verification = await sendEmailService({to:email,subject:'Verification',message:`<h2>Link Verification Email</h2>
  <a href="http://localhost:3000/auth/verify?email=${token}">Click Here</a>
  `})
  // check is email valid
  if(!verification) return next(new Error('email verify fail',{cause:400})) 
  // Hashed password 
  const hashedPassword = bcrypt.hashSync(password,+process.env.SALT_ROUNDES)
  if(!hashedPassword) return next(new Error('password fail try again',{cause:400}))
  // create a new User 
  const newUser = await User.create({username,email,password:hashedPassword,age,role,phoneNumbers,addresses})
  if(!newUser) return next(new Error('created failed',{cause:400}))
  req.savedDocument = {model:User,_id:newUser._id}
  res.status(201).json({msg:'account created successfully'})
}

export const verifyEmail = async (req,res,next)=>{
  // destructure email from request query
  const {email} = req.query
  // decode email by jwt 
  const decodeEmail = jwt.verify(email,process.env.VERIFICATION)
  // find this account 
  const account = await User.findOne({email: decodeEmail.email})
  if(!account) return next(new Error('account not found',{cause:404}))
  // check if this account already verified
  if (account.isEmailVerified ) res.status(200).json({message:'this account already verifiy'})
  // verified account in database
  account.isEmailVerified = true
  await account.save()
  res.status(200).json({message:'email verified successfully'})
}

export const signIn = async (req,res,next)=>{
  // destructure the required data for request body
  const {email,password} = req.body
  // find this account
  const account = await User.findOne({email})
  if(!account) return next(new Error('account not found',{cause:404}))
  // check if this account already verified
  if (!account.isEmailVerified ) return next(new Error('account not verified',{cause:400}))
  // check if password is correct
  const isPasswordCorrect = bcrypt.compareSync(password,account.password)
  if(!isPasswordCorrect) return next(new Error('password incorrect',{cause:400}))
  // update login status
  account.isLoggedIn = true
  await account.save()
  // create token
  const token = jwt.sign(
    {id:account._id,email:account.email,username:account.username,
      createdAt:account.createdAt,age:account.age,role:account.role,
      addresses:account.addresses},
      process.env.TOKEN_SIGNATURE,
      {expiresIn: '9d'})
  res.status(200).json({message: 'login successful', token})
}



// update profile data
export const updateUser = async (req,res,next)=>{
  // destructure the required data for request body
  const {username,age,phoneNumbers,addresses,oldPassword,newPassword,email} = req.body 
  const {id} = req.user
  // User Account
  const user = await User.findById(id)
  if(!user) return next(new Error('account not found',{cause:404}))
  if(email) {
    // check if email is already exists in database
    const checkEmail = await User.findOne({email})
    if(checkEmail) return next(new Error('Email is already exists',{cause:409}))
    // email token
    const token = jwt.sign({email},process.env.VERIFICATION,{expiresIn: '2m'})
      // send email verification
      const verification = await sendEmailService({to:email,subject:'Verification',message:`<h2>Link Verification Email</h2>
      <a href="http://localhost:3000/auth/verify?email=${token}">Click Here</a>
      `})
      // check is email valid
      if(!verification) return next(new Error('email verify fail',{cause:400}))
      // reset email verification
      user.isEmailVerified = false
      await user.save()
  }
  if(oldPassword){
    // check if old password is correct
      const checkOldPassword = bcrypt.compareSync(oldPassword,user.password)
      if(!checkOldPassword) return next(new Error('password incorrect',{cause:400}))
      // hashed new password
      const hashedPassword = bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDES)
      if(!hashedPassword) return next(new Error('password fail try again',{cause:400}))
      // update password only
      user.password = hashedPassword
      await user.save()
  }
    // update account
      const update = await User.findByIdAndUpdate(id,{username,age,phoneNumbers,addresses,email},{new:true} ).select('-password -isEmailVerified -isLoggedIn')
      if(!update) return next(new Error('update fail',{cause:400}))
      return res.status(200).json({message:'success',data:update})
}

export const deleteUser = async (req,res,next)=>{
  const {id} = req.user
  // delete account
  const deleteAccount = await User.findByIdAndDelete(id)
  if(!deleteAccount) return next(new Error('delete fail',{cause:400}))
  return res.status(200).json({message:'Accound deleted successfully'})
}