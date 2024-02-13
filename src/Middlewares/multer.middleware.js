import multer from "multer"
import extension from "../utils/extension.js"


const multerMiddleware = (customExtension = extension.images)=>{
  const storage = multer.diskStorage({})

  const fileFilter = (req,file,cb)=>{
    if(customExtension.includes(file.mimetype)){
     return  cb(null,true)
    }
      return    cb(new Error(`invalid extension ${file.mimetype}`))
  }
  const upload = multer({fileFilter,storage})
  return upload
}

export default multerMiddleware