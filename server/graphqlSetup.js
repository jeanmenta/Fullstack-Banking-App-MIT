const { buildSchema } = require('graphql');
const {
    getTransactions,
    createTransaction,
    getBalanceByEmail,
    updateBalance,
    createAccount
} = require('./dataAccessLayer');

const schema = buildSchema(`
  type Query {
    balance(email: String!): Float
    transactions(email: String!): [Transaction]
  }

  type Mutation {
    addTransaction(transaction: TransactionInput!): Transaction!
    createAccount(name: String!, email: String!, password: String!): AccountResponse!
  }

  type AccountResponse {
    status: String!
    message: String!
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
    createAccount: async ({ name, email, password }) => {
        const result = await createAccount(name, email, password);
        if (result) {
            return { status: "success", message: "Account created" };
        } else {
            return { status: "failure", message: "Couldn't create account" };
        }
    }
};

module.exports = { schema, root };
