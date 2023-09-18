const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3000'
}));

const uri = "mongodb+srv://jeanlmenta:Gugqeb-6cogme-vixmej@bankingdb.vqj39qv.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let collection;

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        collection = client.db("BankingDB").collection("Transactions");

        app.get('/transactions', async (req, res) => {
            const transactions = await collection.find({}).toArray();
            res.json(transactions);
        });

        app.post('/transactions', async (req, res) => {
            const newTransaction = req.body;
            const result = await collection.insertOne(newTransaction);

            // Update user balance
            const balanceCollection = client.db("BankingDB").collection("Balances");
            const accountId = newTransaction.accountId;
            const amount = parseFloat(newTransaction.amount);
            if (newTransaction.type === 'Deposit') {
                await balanceCollection.updateOne({ accountId }, { $inc: { balance: amount } }, { upsert: true });
            } else if (newTransaction.type === 'Withdraw') {
                await balanceCollection.updateOne({ accountId }, { $inc: { balance: -amount } });
            }

            res.json(result);
        });

        app.get('/balance/:email', async (req, res) => {
            const email = req.params.email;
            const balanceCollection = client.db("BankingDB").collection("Balances");
            const userBalance = await balanceCollection.findOne({ accountId: email });
            if (userBalance) {
                res.json({ balance: userBalance.balance });
            } else {
                res.json({ balance: 0 });
            }
        });


        app.post('/create-account', async (req, res) => {
            const { email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { email, password: hashedPassword };
            const result = await userCollection.insertOne(newUser);

            // Initialize balance for the new user
            const balanceCollection = client.db("BankingDB").collection("Balances");
            await balanceCollection.insertOne({ accountId: email, balance: 0 });

            res.json(result);
        });


        // New endpoint for user login
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            const user = await userCollection.findOne({ email });
            if (user && await bcrypt.compare(password, user.password)) {
                res.json({ status: 'success', email: user.email });
            } else {
                res.status(401).json({ status: 'failure', message: 'Invalid credentials' });
            }
        });


        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
        });
    } catch (err) {
        console.error("MongoDB connection failed:", err);
    }
}

run().catch(console.dir);
