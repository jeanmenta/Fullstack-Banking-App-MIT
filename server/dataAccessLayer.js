const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://jeanlmenta:Gugqeb-6cogme-vixmej@bankingdb.vqj39qv.mongodb.net/?retryWrites=true&w=majority";

const bcrypt = require('bcrypt');

const client = new MongoClient(uri);

module.exports = {
    connect: async () => {
        await client.connect();
    },
    getTransactions: async () => {
        const collection = client.db("BankingDB").collection("Transactions");
        return await collection.find({}).toArray();
    },
    createTransaction: async (transaction) => {
        const collection = client.db("BankingDB").collection("Transactions");
        return await collection.insertOne(transaction);
    },
    getBalanceByEmail: async (email) => {
        const collection = client.db("BankingDB").collection("Users");
        const user = await collection.findOne({ email });
        return user ? user.balance : 0;
    },
    getUserDataByEmail: async (email) => {
        const userCollection = client.db("BankingDB").collection("Users");
        const user = await userCollection.findOne({ email });

        const balanceCollection = client.db("BankingDB").collection("Balances");
        const balance = await balanceCollection.findOne({ accountId: email });

        const transactionCollection = client.db("BankingDB").collection("Transactions");
        const transactions = await transactionCollection.find({ accountId: email }).toArray();

        return {
            email: user.email,
            balance: balance ? balance.balance : 0,
            transactions
        };
    },
    updateBalance: async (accountId, amount, type) => {
        const collection = client.db("BankingDB").collection("Users");
        const incAmount = type === 'Deposit' ? amount : -amount;
        return await collection.updateOne({ email: accountId }, { $inc: { balance: incAmount } });
    },
    createAccount: async (name, email, password) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const collection = client.db("BankingDB").collection("Users");
        return await collection.insertOne({ name, email, password: hashedPassword, balance: 0 });
    },
    login: async (email, password) => {
        const collection = client.db("BankingDB").collection("Users");
        const user = await collection.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            return { status: 'success', email: user.email };
        }
        return { status: 'failure', message: 'Invalid credentials' };
    }
};
