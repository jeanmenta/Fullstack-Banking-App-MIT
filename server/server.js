const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { connect } = require('./dataAccessLayer');
const { schema, root } = require('./graphqlSetup');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

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
