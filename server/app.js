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
    updateBalance,
    createAccount,
} = require('./dataAccessLayer');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const schema = buildSchema(`
  type Query {
    balance(email: String!): Float
    transactions(email: String!): [Transaction]
  }

  type Mutation {
    addTransaction(transaction: TransactionInput!): Transaction!
     createAccount(name: String!, email: String!, password: String!): AccountResponse!
  login(email: String!, password: String!): LoginResponse!
  }

  type AccountResponse {
    status: String!
    message: String!
  }
  
  type LoginResponse {
    status: String!
    email: String
    message: String
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
        await updateBalance(withdrawal.accountId, -amount, 'Withdraw');
        return withdrawal;
    },
    createAccount: async ({ name, email, password }) => {
        const result = await createAccount(name, email, password);
        if (result) {
            return { status: "success", message: "Account created" };
        } else {
            return { status: "failure", message: "Couldn't create account" };
        }
    },
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

connect().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
