
const reqKeys = ['body', 'headers', 'query', 'params','file','files']

const vld = (schema)=>{
  return (req, res, next) => {
    const err = [];
  for(const key of reqKeys){
    const validationResult = schema[key]?.validate(req[key],{abortEarly:false})
    if(validationResult?.error){
      err.push(...validationResult.error.details)
    }
  }
    if(err.length){
      return res.status(400).json({errors: err.map((error)=> error.message)})
     }
     next()
  }
}

export default vld;