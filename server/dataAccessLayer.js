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
    updateBalance: async (accountId, amount, type) => {
        const collection = client.db("BankingDB").collection("Users");
        const incAmount = type === 'Deposit' ? amount : -amount;
        return await collection.updateOne({ email: accountId }, { $inc: { balance: incAmount } });
    },
    createAccount: async (name, email, password) => {
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        const collection = client.db("BankingDB").collection("Users");

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return null;
        }
        return await collection.insertOne({ name, email, password: hashedPassword, balance: 0 });
    }
};
