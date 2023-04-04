const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// RsfwTCSOfaPAGz9l
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
    const userCollection = database.collection("users");
    const itemsCollection = database.collection("items");

    // GET API
    app.get('/items', async (req, res) => {
      const cursor = itemsCollection.find({})
      const products = await cursor.toArray()
      res.send(products)
    })

    // POST API
    app.post('/addItems', async (req, res) => {
      const product = req.body
      const result = await itemsCollection.insertOne(product)
      res.json(result)
    })

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
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
