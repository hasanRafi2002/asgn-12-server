

// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const admin = require('firebase-admin');
// const Stripe = require('stripe');

// dotenv.config();

// // Initialize Express app
// const app = express();

// app.use(express.json());
// app.use(bodyParser.json());

// app.use(cors({
//   origin: ["https://rafi-a12.netlify.app", "http://localhost:5173"],
//   credentials: true,
// }));





// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // MongoDB connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('MongoDB connected successfully');
//   } catch (err) {
//     console.error('Failed to connect to MongoDB:', err.message);
//     process.exit(1);
//   }
// };
// connectDB();

// // Import parts
// require('./ServerFiles/Firebase')(app, admin); // Firebase Admin config
// require('./ServerFiles/Authentication')(app); // Authentication Routes
// require('./ServerFiles/User')(app); // User Schema and Routes
// require('./ServerFiles/Property')(app); // Property Schema and Routes
// require('./ServerFiles/Review')(app); // Review Schema and Routes
// require('./ServerFiles/Wishlist')(app); // Wishlist Schemas and Routes
// require('./ServerFiles/Offer')(app); // Offer Schemas and Routes


// // Stripe Payment Intent route
// app.post('/create-payment-intent', async (req, res) => {
//   const { amount } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount, // Amount in cents
//       currency: 'usd',
//     });

//     res.status(200).send({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     res.status(500).send({
//       error: error.message,
//     });
//   }
// });

// // Global error handling
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'An error occurred', error: err.message });
// });

// process.on('uncaughtException', (err) => {
//   console.error('Uncaught exception:', err);
//   process.exit(1);
// });

// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled rejection:', err);
//   process.exit(1);
// });

// // Start server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;





const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const Stripe = require('stripe');

dotenv.config();

// Initialize Express app
const app = express();

app.use(express.json());
app.use(bodyParser.json());

const allowedOrigins = ["https://rafi-a12.netlify.app", "http://localhost:5173"];
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};
connectDB();

// Import parts
require('./ServerFiles/Firebase')(app, admin); // Firebase Admin config
require('./ServerFiles/Authentication')(app); // Authentication Routes
require('./ServerFiles/User')(app); // User Schema and Routes
require('./ServerFiles/Property')(app); // Property Schema and Routes
require('./ServerFiles/Review')(app); // Review Schema and Routes
require('./ServerFiles/Wishlist')(app); // Wishlist Schemas and Routes
require('./ServerFiles/Offer')(app); // Offer Schemas and Routes

// Stripe Payment Intent route
app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An error occurred', error: err.message });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;