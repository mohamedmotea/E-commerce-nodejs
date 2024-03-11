import { Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { rule } from './../../utils/systemRule.js';
import vld from './../../Middlewares/validation.middleware.js';
import auth from './../../Middlewares/auth.middleware.js';
import * as OC from './order.controller.js'
import * as validationSchema from './order.validator.js'
const router = Router()

router
.post('/',vld(validationSchema.createOrder),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.createOrder))
.post('/cart',vld(validationSchema.orderByCart),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.orderByCart))
.put('/:orderId',vld(validationSchema.deliverOrder),auth([rule.DELIVER]),expressAsyncHandler(OC.deliverOrder))
.patch('/:orderId',vld(validationSchema.cancelledOrder),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.cancelledOrder))
.get('/:orderId',vld(validationSchema.cancelledOrder),auth([rule.SUPERADMIN]),expressAsyncHandler(OC.getOrderData))
.get('/',vld(validationSchema.getOrders),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.getOrders))
// payment -> stripe
.post('/checkout/:orderId',auth([rule.USER,rule.SUPERADMIN,rule.ADMIN]),expressAsyncHandler(OC.payWithStripe))
.post('/webhook',expressAsyncHandler(OC.webhookLocal))
.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'].toString();
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.WEBHOOK_SECRET_KEY);
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
export default router