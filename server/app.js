const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
    connect,
    getTransactions,
    createTransaction,
    getBalanceByEmail,
    getUserDataByEmail,
    updateBalance,
    createAccount,
    login
} = require('./dataAccessLayer');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize MongoDB connection
connect().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

app.get('/user/:email', async (req, res) => {
    const userData = await getUserDataByEmail(req.params.email);
    if (userData) {
        res.json(userData);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.get('/transactions', async (req, res) => {
    const transactions = await getTransactions();
    res.json(transactions);
});

app.post('/transactions', async (req, res) => {
    const newTransaction = req.body;
    const result = await createTransaction(newTransaction);
    const amount = parseFloat(newTransaction.amount);
    await updateBalance(newTransaction.accountId, amount, newTransaction.type);
    res.json(result);
});

app.get('/balance/:email', async (req, res) => {
    const balance = await getBalanceByEmail(req.params.email);
    res.json({ balance });
});

app.post('/create-account', async (req, res) => {
    const { name, email, password } = req.body;
    const result = await createAccount(name, email, password);
    res.json(result);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await login(email, password);
    if (result.status === 'success') {
        res.json(result);
    } else {
        res.status(401).json(result);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});













