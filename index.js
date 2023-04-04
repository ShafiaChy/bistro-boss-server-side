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

async function run() {
  try {
    const database = client.db("bistro-boss");
    const paymentsCollection = database.collection("payment");
    const userCollection = database.collection("users");
    const itemsCollection = database.collection("items");
    const cartsCollection = database.collection("carts");

    // GET API
    app.get("/items", async (req, res) => {
      const cursor = itemsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // POST API
    app.post("/addItems", async (req, res) => {
      const product = req.body;
      const result = await itemsCollection.insertOne(product);
      res.json(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    app.get("/carts", async (req, res) => {
      const cursor = cartsCollection.find({});
      const carts = await cursor.toArray();
      res.send(carts);
    });

    app.post("/carts", async (req, res) => {
      const carts = req.body;
      console.log(carts);
      // TODO: make sure you do not enter duplicate user email
      // only insert users if the user doesn't exist in the database
      const result = await cartsCollection.insertOne(carts);
      res.send(result);
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

app.get("/", (req, res) => {
  res.send("Welcome to Bistro Boss");
});

app.listen(port, () => {
  console.log(`Bistro Boss server is running on port: ${port}`);
});
