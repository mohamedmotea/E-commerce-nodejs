import db_connection from '../DB/connection.js'
import globalResponse from './Middlewares/global-response.middleware.js'
import rollbackUploudedFiles from './Middlewares/rollback-uplouded-files-middleware.js'
import rollbackSavedDocuments from './Middlewares/rollback-saved-documents.middleware.js'
import * as router from './Modules/index.routers.js'
import { verifyCouponVaild } from './utils/crons.js'

const initiateApp = (app,express)=>{
  const port = process.env.PORT
  
  db_connection()
  app.use('/order/webhook', express.raw({type: 'application/json'}), (request, response) => {
    console.log('here')
    const sig = request.headers['stripe-signature'].toString();
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, process.env.WEBHOOK_SECRET_KEY);
      console.log('event')
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSessionCompleted = event.data.object;
        console.log('checkoutSessionCompleted',checkoutSessionCompleted)
        // Then define and call a function to handle the event checkout.session.completed
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  });
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
  app.listen(port, () => console.log(`server app listening on port ${port}!`))
}
export default initiateApp