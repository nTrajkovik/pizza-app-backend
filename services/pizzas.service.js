const fs = require('fs');
const path = require('path');
let pizzasCollection;
exports.registerMongoClient = (_client) => {
    pizzasCollection = _client.db('pizza-app').collection('pizzas');
};

exports.getAll = async (req, res) => {
    try {
        let { priceFrom, priceSmallSort, priceBigSort, ingredients, tags, search } = req.query;
        let filterQuery = {};
        if (priceFrom) {
            filterQuery.priceSmall = { $gte: parseInt(priceFrom) };
            filterQuery.priceBig = { $gte: parseInt(priceFrom) };
        }
        if (ingredients) {
            filterQuery.ingredients = { $regex: ingredients }
        }
        if (search && search.length) {
            filterQuery.$or = [
                { tags: { $elemMatch: { $in: [ search ] } } },
                { ingredients: { $regex: search } },
                { name: { $regex: search } }
            ];
        }
        if (tags && tags.length) {
            tags = JSON.parse(tags);
            filterQuery.tags = { $elemMatch: { $in: tags } }
        }
        let sortQuery = {};
        if (priceSmallSort) {
            sortQuery.priceSmall = priceSmallSort;
        }
        if (priceBigSort) {
            sortQuery.priceBig = priceBigSort;
        }
        console.log(filterQuery);
        const pizzas = await pizzasCollection.find(filterQuery).sort(sortQuery).toArray();
        return res.json(pizzas);
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
    }
};

exports.getOne = async (req, res) => {
    const id = req.params.id;
    try {
        const pizza = await pizzasCollection.findOne({_id: id});
        res.json(pizza);
    } catch (e) {
        console.error(e);
    }
};

exports.insertOne = async (req, res) => {
    const pizza = req.body;
    // const getMeta = (base64Data) => base64Data.substring("data:image/".length, base64Data.indexOf(";base64"))
    // const getBase64 = (base64Data) => base64Data
    //         .replace(/^data:image\/png;base64,/, "")
    //         .replace(/^data:image\/jpeg;base64,/, "")
    //         .replace(/^data:image\/jpg;base64,/, "");
    try {
        // const imageName = pizza.name + '.' + getMeta(pizza.image);
        // fs.writeFileSync(path.join('public', imageName), new Buffer.from(getBase64(pizza.image), 'base64'))
        // pizza.image = imageName;
        await pizzasCollection.insertOne(pizza);
        res.end({message: 'Success on writing pizza', data: JSON.stringify(pizza)});
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
        const result = await pizzasCollection.deleteOne({_id: id});
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

exports.updateOne = async (req, res) => {
    const id = req.params.id;
    const newPizza = req.body;
    try {
        const result = await pizzasCollection.findOneAndUpdate({_id: id}, {$set: newPizza});
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

