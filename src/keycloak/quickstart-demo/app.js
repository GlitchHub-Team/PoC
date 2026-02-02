import express from 'express';
import session from 'express-session'
import Keycloak from 'keycloak-connect';

import {add_tenant} from './scripts/add-tenant.js';

const app = express()
// const session = session()

const port = 3000;

const memoryStore = new session.MemoryStore();

console.log(app.request.baseUrl)

 // Configure session
// app.use(
//     session({
//     secret: 'mySecret',
//     resave: false,
//     saveUninitialized: true,
//     store: memoryStore,
//     })
// );


// Middleware configuration loaded from keycloak.json file.
const keycloak = new Keycloak({  });

app.use(keycloak.middleware());

console.log(createLoginUrl())

app.get('/add-tenant/:tenant_name', async (req, res) => {
  let tenant_name = req.params.tenant_name
  try {
    await add_tenant(tenant_name)
    res.json({message: `added tenant ${tenant_name} successfully`})
  }
  catch (e) {
    res.json({message: `${tenant_name} already exists!`})
  }
})

app.get('/', (req, res) => {
  res.json({message: 'this is a public page.'})
})

app.get('/login/:username/:pw', (req, res) => {

})

app.get('/secured', keycloak.protect('realm:user'), (req, res) => {
  res.json({message: 'secured'});
});

app.get('/admin', keycloak.protect('realm:admin'), (req, res) => {
  res.json({message: 'admin'});
});

app.use('*', (req, res) => {
  res.send('Not found!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});

