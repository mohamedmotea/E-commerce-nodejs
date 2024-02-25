
import  jwt from 'jsonwebtoken';
import sendEmailService from '../../Services/send-emails.services.js';


const verifyEmailService = async(email,req)=>{
  // email Token 
  const token = jwt.sign({email},process.env.VERIFICATION,{expiresIn: '2m'})
  // send email verification
  const verification = await sendEmailService({to:email,subject:'Verification',message:`<h2>Link Verification Email</h2>
  <a href=${req.protocol}://${req.headers.host}/auth/verify?email=${token}>Click Here</a>
  `})
    // check is email valid
  if(!verification) return null;
  return true
}

export default verifyEmailService