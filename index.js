const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51KDCwXHsUlB2Uq28DaSvt5Y3RE5zsPzYMRiLATosu3Ewszs78bylCRvPcpYaxpCMRR6nwNiSFuCvtFmaKdHCZy1N00f00KdBqH"
);

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
      api_key: "c4c1d0868d5aafad39d42ff510c061b5-81bd92f8-6f267a89",
      domain: "sandboxa6d7ee93b5f1492c8c6bfb3949a16e2d.mailgun.org",
    },
  };

  const transporter = nodemailer.createTransport(mg(auth));

  // let transporter = nodemailer.createTransport({
  //     host: 'smtp.sendgrid.net',
  //     port: 587,
  //     auth: {
  //         user: "apikey",
  //         pass: process.env.SENDGRID_API_KEY
  //     }
  // });
  console.log("sending email", email);

  transporter.sendMail(
    {
      from: "shafia13.ph@gmail.com", // verified sender email
      to: email || "shafiarahmanchy13@gmail.com", // recipient email
      subject: `Your booking for ${name} is confirmed`, // Subject line
      text: "Hello world!", // plain text body
      html: `
      <h3>Your appointment is confirmed</h3>
      <div>
          <p>Your booking for: ${name} is successful</p>
          <p>Please visit us on ${bookingDate} at ${selectedTime}</p>
          <p>Thanks from Doctors Portal.</p>
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
async function run() {
  try {
    const database = client.db("bistro-boss");
    const paymentsCollection = database.collection("payment");
    const usersCollection = database.collection("users");
    const itemsCollection = database.collection("items");
    const cartsCollection = database.collection("carts");
    const bookingsCollection = database.collection("bookings");

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

    // GET MENU ITEMS
    app.get("/items", async (req, res) => {
      const cursor = itemsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    //GET SHOP ITEMS
    app.get("/shopitem", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const category = req.query.category;
      const query = { category: category };

      const cursor = itemsCollection.find(query);
      const products = await cursor
        .skip(page * size)
        .limit(size)
        .toArray();

      const count = await itemsCollection.countDocuments(query);
      res.send({ count, products });
    });

    // POST ITEMS API
    app.post("/addItems", async (req, res) => {
      const product = req.body;
      const result = await itemsCollection.insertOne(product);
      res.json(result);
    });

    //GET A USER'S CART
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const cartQuery = { email: email };
      const cart = await cartsCollection.find(cartQuery).toArray();

      res.send(cart);
    });
    //GET A USER'S CART
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const bookingQuery = { email: email };
      const booking = await bookingsCollection.find(bookingQuery).toArray();

      res.send(booking);
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

    //   app.get('/jwt', async (req, res) => {
    //     const email = req.query.email;
    //     const query = { email: email };
    //     const user = await usersCollection.findOne(query);
    //     if (user) {
    //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
    //         return res.send({ accessToken: token });
    //     }
    //     res.status(403).send({ accessToken: '' })
    // });

    //   app.get('/users/admin/:email', async (req, res) => {
    //     const email = req.params.email;
    //     const query = { email }
    //     const user = await usersCollection.findOne(query);
    //     res.send({ isAdmin: user?.role === 'admin' });
    // })
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
