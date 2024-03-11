import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from "../../../DB/Models/user.model.js"
import verifyEmailService from './utils/verifyEmail.js';
import {OAuth2Client} from 'google-auth-library'
import uniqueString from './../../utils/generate-unique-string.js';
import { systemProvider } from '../../utils/systemRule.js';
import sendEmailService from '../Services/send-emails.services.js';


export const signUp = async (req,res,next)=>{
  // destructure the required data for request body
  const {username,email,password,age,role,phoneNumbers,addresses} = req.body
  // check if email is already exists in database
  const checkEmail = await User.findOne({email})
  if(checkEmail) return res.status(409).json({message: "Email already exists"})
  // verify Email -> send code in email
const verify = await verifyEmailService(email,req)
// check is email valid
if(!verify) return next(new Error('email verify fail',{cause:400})) 
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
  if (!account.isEmailVerified ) {
      // verify Email -> send code in email
      const verify = await verifyEmailService(email,req)
      if(!verify) return next(new Error('email verify fail',{cause:400}))   
      return next(new Error('account not verified',{cause:400}))
  }
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
// forget password
export const forgetPassword = async (req,res,next)=>{
  // destructure the required data for request body
  const {email} = req.body
  // find this account
  const account = await User.findOne({email})
  if(!account) return next(new Error('account not found',{cause:404}))
  // generate code
  const generateCode = uniqueString(6)
  // hashed code 
  const code = bcrypt.hashSync(generateCode,+process.env.SALT_ROUNDES)
  // generate token 
  const token = jwt.sign({email, code},process.env.RESET_SINGATURE,{expiresIn:'30m'})
  // endPoint to reset
  const resetPassword = `${req.protocol}://${req.headers.host}/auth/reset/${token}`
  const sendCode = sendEmailService({to:email,subject:'Reset Password',message:`
  <h1>Hello ${account.username}</h1>
  <p>Please click on the below link to reset</p>
  <hr/>
  <a href=${resetPassword}>Reset Password</a>
  <br>
  <p>If you don't request a password recovery, ignore this message </p>
  `})
  if(!sendCode) return next(new Error('email send fail',{cause:400}))
  // save code in database
  account.code = code
  await account.save()
  res.status(200).json({message:'code sent successfully , check your email',success:true})
}
// reset password 
export const resetPassword = async (req,res,next)=>{
  // destructure the required data for request body
  const {newPassword} = req.body
  // destructure the required data for request params
  const {token} = req.params
  // decode token
  const data = jwt.verify(token,process.env.RESET_SINGATURE)
  if(!data) return next(new Error('expired , forget password again',{cause:400}));
  // find this account
  const account = await User.findOne({email:data.email,code:data.code})
  if(!account) return next(new Error('already password reset',{cause:400}))
  // hashed new password
  const hashPassword = bcrypt.hashSync(newPassword,+process.env.SALT_ROUNDES)
  account.password = hashPassword
  account.code = null
  await account.save()
  res.status(200).json({message:'password reset successfully',success:true})
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
    // verify Email -> send code in email
    const verify = await verifyEmailService(email,req)
    // check is email valid
    if(!verify) return next(new Error('email verify fail',{cause:400})) 
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
// delete account
export const deleteUser = async (req,res,next)=>{
  const {id} = req.user
  // delete account
  const deleteAccount = await User.findByIdAndDelete(id)
  if(!deleteAccount) return next(new Error('delete fail',{cause:400}))
  return res.status(200).json({message:'Accound deleted successfully'})
}
// SignUp With Google
export const googleSignUp = async (req,res,next)=>{
  const {idToken} = req.body
  const client = new OAuth2Client();
  async function verify() {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload
}
  const result = await verify().catch(console.error);
  if(!result.email_verified) return next(new Error('email not verified',{cause:400}))
  // login login
  // check email
    const checkEmail = await User.findOne({email:result.email})
    if(checkEmail) return next(new Error('email is already exist',{cause:409}))
// Hashed password 
    const defualtPassword = uniqueString(10)
const hashedPassword = bcrypt.hashSync(defualtPassword,+process.env.SALT_ROUNDES)
if(!hashedPassword) return next(new Error('password fail try again',{cause:400}))
// create a new User 
const newUser = await User.create({
  username:result.name
  ,email:result.email
  ,password:hashedPassword
  ,isEmailVerified:result.email_verified
  ,provider:systemProvider.GOOGLE
})
if(!newUser) return next(new Error('created failed',{cause:400}))
req.savedDocument = {model:User,_id:newUser._id}
res.status(201).json({msg:'account created successfully',success:true})
}
// SignIn With Google
export const googleLogin = async (req,res,next)=>{
  const {idToken} = req.body
  const client = new OAuth2Client();
  async function verify() {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload
}
  const result = await verify().catch(console.error);
  if(!result.email_verified) return next(new Error('email not verified',{cause:400}))
  // login login
  // find this account
    const account = await User.findOne({email:result.email,provider:systemProvider.GOOGLE})
    if(!account) return next(new Error('account not found',{cause:404}))
    account.isLoggedIn = true
  await account.save()
  // create token
  const token = jwt.sign(
    {id:account._id,email:account.email,username:account.username,
      createdAt:account.createdAt,age:account.age,role:account.role,
      addresses:account.addresses},
      process.env.TOKEN_SIGNATURE,
      {expiresIn: '9d'})
  res.status(200).json({message: 'login successful', token,success:true})
}
