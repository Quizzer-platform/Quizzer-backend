import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

const app = express();
const port = 4001;

// Initialize Stripe
if (!process.env.SECRET_KEY) {
  console.error('❌ Stripe Secret Key is missing! Check your .env file.');
  process.exit(1); // Exit if missing credentials
}

const stripe = new Stripe(process.env.SECRET_KEY);

app.use(cors());
app.use(express.json());

// // Stripe Webhook Endpoint
// app.post(
//   '/stripe/webhook',
//   express.raw({ type: 'application/json' }),
//   async (request, response) => {
//     const sig = request.headers['stripe-signature'];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         request.body,
//         sig,
//         process.env.END_POINT_SECRET
//       );
//     } catch (err) {
//       console.error('❌ Webhook signature verification failed:', err.message);
//       return response.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === 'payment_intent.succeeded') {
//       console.log('💰 PaymentIntent was successful!');
//     }

//     response.json({ received: true });
//   }
// );

// Create Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'egp',
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
