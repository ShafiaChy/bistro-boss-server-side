const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

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

function sendBookingEmail(booking) {
  const { email, name, bookingDate, selectedTime } = booking;

  const auth = {
    auth: {
      api_key: process.env.EMAIL_SEND_KEY,
      domain: process.env.EMAIL_SEND_DOMAIN,
    },
  };

  const transporter = nodemailer.createTransport(mg(auth));

  console.log("sending email", email);

  transporter.sendMail(
    {
      from: "shafia@programming-hero.com", // verified sender email
      to: "shafiarahmanchy13@gmail.com", // recipient email
      subject: `Your booking for ${name} is confirmed`, // Subject line
      text: "Hello world!", // plain text body
      html: `
      <h3>Your appointment is confirmed</h3>
      <div>
          <p>Your booking for: ${name} is successful</p>
          <p>Please visit us on ${bookingDate} at ${selectedTime}</p>
          <p>Thanks from Bistro Boss.</p>
      </div>
      
      `, // html body
    },
    function (error, info) {
      if (error) {
        console.log("Email send error", error);
      } else {
        console.log("Email sent: " + info);
      }
    }
  );
}

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "forbidden access",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      console.log(err);
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const database = client.db("bistro-boss");
    const paymentsCollection = database.collection("payment");
    const usersCollection = database.collection("users");
    const itemsCollection = database.collection("items");
    const cartsCollection = database.collection("carts");
    const bookingsCollection = database.collection("bookings");
    const reviewsCollection = database.collection("reviews");

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      console.log(decodedEmail, "hi");
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "3h",
        });
        return res.status(200).json({
          success: true,
          accessToken: token,
        });
      }
      res.status(403).json({
        success: false,
        message: "Forbidden User",
      });
    });

    //GET USERS API
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    //POST USERS API
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.put("/users/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //GET ITEMS
    app.get("/items", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const category = req.query.category;
      const query = { category: category };

      if (size && category) {
        const cursor = itemsCollection.find(query);
        const products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();

        const count = await itemsCollection.countDocuments(query);
        res.send({ count, products });
      } else {
        const cursor = itemsCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
      }
    });

    //UPDATE ITEM
    app.patch("/items/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const items = req.body;
      console.log(items);
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          ...(items.name && { name: items.name }),
          ...(items.recipe && { recipe: items.recipe }),
          ...(items.image && { image: items.image }),
          ...(items.price && { price: items.price }),
          ...(items.category && { category: items.category }),
        },
      };
      const result = await itemsCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    //DELETE ITEMS
    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await itemsCollection.deleteOne(filter);
      res.send(result);
    });
    // POST ITEMS API
    app.post("/addItems", async (req, res) => {
      const product = req.body;
      const result = await itemsCollection.insertOne(product);
      res.json(result);
    });

    //GET A USER'S CART
    app.get("/carts", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const cartQuery = { email: email };
      const cart = await cartsCollection.find(cartQuery).toArray();

      res.send(cart);
    });
    //GET Bookings
    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (email) {
        const bookingQuery = { email: email };
        const booking = await bookingsCollection.find(bookingQuery).toArray();
        res.send(booking);
      } else {
        const booking = await bookingsCollection.find({}).toArray();

        res.send(booking);
      }
    });

    app.patch("/bookings/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await bookingsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      return res.status(200).json({
        success: true,
        result: result,
      });
    });

    //POST A USER'S CART
    app.post("/carts", async (req, res) => {
      const carts = req.body;
      console.log(carts);
      // TODO: make sure you do not enter duplicate user email
      // only insert users if the user doesn't exist in the database
      const result = await cartsCollection.insertOne(carts);
      console.log(result);
      res.send(result);
    });

    //POST A USER'S CART
    app.post("/bookings", async (req, res) => {
      const bookings = req.body;
      console.log(bookings);
      // TODO: make sure you do not enter duplicate user email
      // only insert users if the user doesn't exist in the database
      const result = await bookingsCollection.insertOne(bookings);
      sendBookingEmail(bookings);
      console.log(result);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      console.log(order.total);
      const price = parseFloat(order.total);
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

    app.delete("/carts/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await cartsCollection.deleteOne(filter);
      res.send(result);
    });

    app.delete("/bookings/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await bookingsCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/payments", async (req, res) => {
      const email = req.query.email;
      const paymentQuery = { email: email };
      const payment = await paymentsCollection.find(paymentQuery).toArray();

      res.send(payment);
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);

      res.send(result);
    });

    //POST REVIEWS

    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      console.log(reviews);
      // TODO: make sure you do not enter duplicate user email
      // only insert users if the user doesn't exist in the database
      const result = await reviewsCollection.insertOne(reviews);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const query = {};
      const reviews = await reviewsCollection.find(query).toArray();
      res.send(reviews);
    });
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
