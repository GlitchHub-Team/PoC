const express = require('express');

const app = express();

const session = require('express-session');
const Keycloak = require('keycloak-connect');

const memoryStore = new session.MemoryStore();

 // Configure session
app.use(
    session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    })
);

const keycloak = new Keycloak({ store: memoryStore });

app.use(keycloak.middleware())

app.listen(3000, function () {
    console.log('App listening on port 3000');
});

app.get("/", (req, res) => {
    res.json({message: 'ciao'})
})

app.get("/create/:tenant-name", (req, res) => {
    
})