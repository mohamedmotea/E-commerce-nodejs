
const globalResponse = (err,req,res,next)=>{
  if(err){
    res.status(err['cause'] || 500).json({error:err.message});
    next()
  } 
}
export default globalResponse;