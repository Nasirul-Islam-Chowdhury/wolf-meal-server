const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors())
require("dotenv").config()
const uri = `mongodb+srv://${process.env.wolf_meal_db_user}:${process.env.wolf_meal_db_password}@cluster0.bbqqyyb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        const mealsCollection = client.db("wolfMeal").collection("meals");
        const ordersCollection = client.db("wolfMeal").collection("orders");
        app.get('/', (req, res) => {
            res.send("running")
        })
        app.get('/meals', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const query = {};
            const cursor = mealsCollection.find(query);
            const meals = await cursor.skip(page * size).limit(size).toArray()
            const count = await mealsCollection.estimatedDocumentCount()
            res.send({ meals, count })
        })
        app.get('/newmeals', async (req, res) => {
            const query = {};
            const cursor = mealsCollection.find(query);
            const meals = await cursor.limit(3).toArray()
            res.send(meals)
        })
        app.get('/orders', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray()
            res.send(orders)
        })

        app.get('/meals/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const single = await mealsCollection.findOne(query);
            res.send(single)
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const deleteditem = await ordersCollection.deleteOne(query);
            res.send(deleteditem)
        })

        app.post('/orders', async (req, res) => {
            const query = req.body;
            const result = await ordersCollection.insertOne(query)
            res.send(result);
        })
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(req.body)
            const { name, email, phone, address, message } = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    message: message,
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

    } finally {

    }
}
run().catch(err => console.err);

app.listen(port, () => {
    console.log(`Wolf meal running on port ${port}`)
})