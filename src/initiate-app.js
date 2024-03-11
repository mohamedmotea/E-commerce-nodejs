import cors from 'cors'
import db_connection from '../DB/connection.js'
import globalResponse from './Middlewares/global-response.middleware.js'
import rollbackUploudedFiles from './Middlewares/rollback-uplouded-files-middleware.js'
import rollbackSavedDocuments from './Middlewares/rollback-saved-documents.middleware.js'
import * as router from './Modules/index.routers.js'
import { verifyCouponVaild } from './utils/crons.js'
import Io, { generateIo } from './utils/socketIo.js';
import Product from './../DB/Models/product.model.js';

const initiateApp = (app,express)=>{
  const port = process.env.PORT
  
    // c-o-r-s (https)
    app.use(cors())
  db_connection()

  // parse data by express
  app.use(express.json())

  // routes
  app.use('/auth',router.authRouter)
  app.use('/user',router.userRouter)
  app.use('/category',router.categoryRouter)
  app.use('/subcategory',router.subCategoryRouter)
  app.use('/brand',router.brandRouter)
  app.use('/product',router.productRouter)
  app.use('/cart',router.cartRouter)
  app.use('/coupon',router.couponRouter)
  app.use('/order',router.orderRouter)
  app.use('*',(req,res,next)=> res.status(404).json({message:'page not found'}))
  
  // middleware to handle any errors
  app.use(globalResponse,rollbackUploudedFiles,rollbackSavedDocuments)
  // check coupon is available in * 24h
  verifyCouponVaild()
  // global router for handle invalid routes
  app.get('/', (req, res) => res.status(200).json({message:'invalid request'}))
  const server = app.listen(port, () => console.log(`server app listening on port ${port}!`))
  const io = generateIo(server)

   io.on('connection',(socket)=>{
      socket.on('getProducts',async()=>{
        const products = await Product.find()
        socket.emit('retrieveProducts',{products})
      })
      
      // socket.on('addProduct',(data)=>{
      //   console.log(data)
      // })
      
    })

}
export default initiateApp