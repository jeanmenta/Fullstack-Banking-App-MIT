const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
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

const schema = buildSchema(`
  type Query {
    balance(email: String!): Float
    transactions(email: String!): [Transaction]
  }

  type Mutation {
    addTransaction(transaction: TransactionInput!): Transaction
  }

  type Transaction {
    id: String
    type: String
    amount: Float
    effectiveDate: String
  }

  input TransactionInput {
    id: String!
    type: String!
    amount: Float!
    effectiveDate: String!
    accountId: String!
  }
`);

const root = {
    balance: async ({ email }) => {
        return await getBalanceByEmail(email);
    },
    transactions: async ({ email }) => {
        const transactions = await getTransactions();
        return transactions.filter(t => t.accountId === email);
    },
    addTransaction: async ({ transaction }) => {
        await createTransaction(transaction);
        const amount = parseFloat(transaction.amount);
        await updateBalance(transaction.accountId, amount, transaction.type);
        return transaction;
    },
    addWithdrawal: async ({ withdrawal }) => {
        await createTransaction(withdrawal);
        const amount = parseFloat(withdrawal.amount);
        await updateBalance(withdrawal.accountId, -amount, 'Withdraw');  // Note the negative sign
        return withdrawal;
    }
};

app.use(cors());
app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
