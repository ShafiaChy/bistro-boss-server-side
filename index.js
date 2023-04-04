const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51KDCwXHsUlB2Uq28DaSvt5Y3RE5zsPzYMRiLATosu3Ewszs78bylCRvPcpYaxpCMRR6nwNiSFuCvtFmaKdHCZy1N00f00KdBqH"
);

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://bistroboss:RsfwTCSOfaPAGz9l@cluster0.t6qrbl8.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const users = [
  { id: 1, name: "Sabana", email: "sabana@gmail.com" },
  { id: 2, name: "Sabnoor", email: "sabnoor@gmail.com" },
  { id: 3, name: "Sabila", email: "sabila@gmail.com" },
];
async function run() {
  try {
    const userCollection = client.db("bistro-boss").collection("users");
    const paymentsCollection = client.db("bistro-boss").collection("payment");

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const price = order.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      console.log(paymentIntent.client_secret);
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // app.post("/payments", async (req, res) => {
    //   const payment = req.body;
    //   const result = await paymentsCollection.insertOne(payment);
    //   const id = payment.orderId;
    //   const filter = { _id: ObjectId(id) };
    //   const updatedDoc = {
    //     $set: {
    //       paid: true,
    //       transactionId: payment.transactionId,
    //     },
    //   };
    //   const updatedResult = await bookingsCollection.updateOne(
    //     filter,
    //     updatedDoc
    //   );
    //   res.send(result);
    // });
  } finally {
  }
}

run().catch((err) => console.log(err));

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Welcome to Bistro Boss");
});

app.listen(port, () => {
  console.log(`Bistro Boss server is running on port: ${port}`);
});
