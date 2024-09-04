const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")("sk_test_51OxFZhSGQc3MHlBJApLSEzHRyXQU9Kpjo8135v5SmKF2SI90bL6Du2fTAfYarc7RQxbhHdMSA1ONB3UySFiLcdbS00ZTt3u8cc");

app.use(express.json());
app.use(cors());

app.post("/api/create-checkout-session", async (req, res) => {
  const { products } = req.body;
  const line_items = products.map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.dish,
      },
      unit_amount: product.price * 100,
    },
    quantity: product.qnty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: line_items,
    mode: "payment", // Corrected parameter name
    success_url: "http://localhost:3000/Sucess",
    cancel_url: "http://localhost:3000/Cancell",
  });

  res.json({ id: session.id });
});

app.listen(7000, () => {
  console.log("Server started on port 7000");
});
