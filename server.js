const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()

const pizzasService = require('./services/pizzas.service');
const ordersService = require('./services/orders.service');
let client = null;
let pizzasCollection = null;

MongoClient.connect(process.env.MONGO_HOST)
    .then((_client) => {
        client = _client;
        pizzasCollection = _client.db('pizza-app').collection('pizzas');
        pizzasService.registerMongoClient(_client);
        ordersService.registerMongoClient(_client);
    }).catch(console.error); 

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.end('Hello from Express!');
});
// pizzas.service
app.get('/pizzas', pizzasService.getAll);
app.get('/pizzas/:id', pizzasService.getOne);
app.post('/pizzas', pizzasService.insertOne);
app.delete('/pizzas/:id', pizzasService.deleteOne);
app.put('/pizzas/:id', pizzasService.updateOne);

// orders.service
app.get('/orders', ordersService.getAll);
app.get('/orders/:id', ordersService.getOne);
app.post('/orders', ordersService.insertOne);
app.delete('/orders/:id', ordersService.deleteOne);
app.put('/orders/:id', ordersService.updateOne);

// not REST-full 
app.get('/pizzas-html', async (req, res) => {
    try {
        const pizzas = await pizzasCollection.find().toArray();
        const renderView = `
            ${
                pizzas.map(pizza => `
                    <div>
                        <h1>${pizza.name}</h1>
                        <img src="${pizza.image}" />
                    </div>
                `).join('<br/>')
            }
        `; 
        res.send(renderView);
    } catch (e) {
        console.error(e);
    }
});
app.use(express.static('public'));
//app.get(...)
app.listen(8081, function() {
    console.log('listening on port 8081...');
});