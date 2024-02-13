import jwt from 'jsonwebtoken'
import User from '../../DB/Models/user.model.js';

const auth = (roles)=>{
  return async(req,res,next)=>{
  try {
      const {token} = req.headers
      if(!token) return next(new Error('token is required',{cause:404}));
      const decodeToken = jwt.verify(token,process.env.TOKEN_SIGNATURE)
      if(!decodeToken) return next(new Error('token fail',{cause:400}))
      const user = await User.findById(decodeToken.id).select('-password');
      if(!roles.includes(user.role)) return next(new Error('unauthorized',{cause:401}));
      req.user = user
      next()
    }
    
    catch (error) {  
      return next(new Error(error,{cause:500}))    
    }
  } 
}
export default auth