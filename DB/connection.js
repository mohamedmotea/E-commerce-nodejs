import mongoose from "mongoose"

const db_connection = async()=>{
 await mongoose.connect(process.env.CONNECTION_DB)
 .then(_=>console.log('connection successful'))
 .catch(_=>console.log('connection failed'))
}
export default db_connection