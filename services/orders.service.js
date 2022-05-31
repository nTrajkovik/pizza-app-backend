const { ObjectId } = require("mongodb");

let ordersCollection;
exports.registerMongoClient = (_client) => {
    ordersCollection = _client.db('pizza-app').collection('orders');
};

exports.getAll = async (req, res) => {
    try {
        const orders = await ordersCollection.find().toArray();
        return res.json(orders);
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
    }
};

exports.getOne = async (req, res) => {
    const id = req.params.id;
    try {
        const order = await ordersCollection.findOne({_id: id});
        res.json(order);
    } catch (e) {
        console.error(e);
    }
};

exports.insertOne = async (req, res) => {
    const order = req.body;
    try {
        const result = await ordersCollection.insertOne(order);
        console.log(`Created order ${result.insertedId}`);
        res.send({message: 'Success on writing order', data: JSON.stringify(order)});
    } catch (e) {
        console.error(e);
        if (e.code === 11000) {
            res.send({message: 'Pizza with that ID already exists'});
        }
        res.sendStatus(400);
    }
};

exports.deleteOne = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await ordersCollection.deleteOne({_id: ObjectId(id)});
        console.log(`Deleted order ${id}`);
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

exports.updateOne = async (req, res) => {
    const id = req.params.id;
    const newOrder = req.body;
    try {
        const result = await ordersCollection.findOneAndUpdate({_id: id}, {$set: newOrder});
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

