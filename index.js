import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongodb from 'mongodb';

const app = express();
app.use(cors());
app.use(bodyParser.json());
dotenv.config();
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

app.get('/', (req, res) => {
    res.status(200).send(`<h1>server is running with NODE.JS</h1>`)
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zhub4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log(err);
    const planCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_CHOSEN_PLAN_COLLECTION}`);

    // post
    app.post('/savePlan', (req, res) => {
        const createPlan = req.body.createPlan;
        planCollection.insertOne(createPlan)
            .then(result => res.status(201).send(result.insertedCount > 0))
            .catch(err => res.status(500).send(err));
    })
    // get
    app.get('/getCurrentUser/:email', (req, res) => {
        const email = req.params.email;
        console.log(email);
        planCollection.find({ email })
            .toArray((err, documents) => {
                if (err) {
                    res.status(404).send(err);
                } else {
                    res.status(200).send(documents[0]);
                }
            })
    })

    // update
    app.patch('/updatePlan', (req, res) => {
        const updatePlan = req.body.updatePlan;
        planCollection.updateOne({ _id: ObjectID(updatePlan.id) }, { $set: { plan: updatePlan.plan, payment: updatePlan.payment, buyDate: updatePlan.buyDate, expireDate: updatePlan.expireDate } })
            .then(result => res.status(200).send(result.modifiedCount > 0))
            .catch(err => res.status(404).send(err));
    })

    // delete
    app.delete('/cancelPlan/:id', (req, res) => {
        const id = req.params.id;
        planCollection.deleteOne({ _id: ObjectID(id) })
            .then(result => res.status(200).send(result.deletedCount > 0))
            .catch(err => res.status(404).send(err));
    })
});


app.listen(process.env.PORT || 5000, () => console.log('server is running'))