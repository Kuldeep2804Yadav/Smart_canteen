const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const paypal = require("@paypal/checkout-server-sdk");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure PayPal Environment
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// Stripe Checkout Session Route
app.post("/api/create-checkout-session", async (req, res) => {
  const { products } = req.body;

  const lineItems = products.map((item) => ({
    price_data: {
      currency: "USD",
      product_data: { name: item.name },
      unit_amount: item.price * 100,
    },
    quantity: item.qnty,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });
    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});

// PayPal Order Route
app.post("/api/create-paypal-order", async (req, res) => {
  const { products } = req.body;

  const totalAmount = products.reduce(
    (acc, product) => acc + product.price * product.qnty,
    0
  );

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalAmount.toFixed(2),
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

// PayPal Order Capture Route
app.post("/api/capture-paypal-order", async (req, res) => {
  const { orderId } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    res.status(200).json({ status: "success", capture: capture.result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to capture PayPal order" });
  }
});

// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
