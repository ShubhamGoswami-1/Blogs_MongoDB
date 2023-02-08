const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connect(){
    const client = await MongoClient.connect('mongodb://127.0.0.1:27017');
    database = client.db('blog');
}

function getDb(){
    if(!database){
        throw { message: 'Database connection not established'};
    }
    return database;
}
module.exports = {
    connectToDatabase: connect,
    getDb: getDb
};
/*
In the next lecture, you'll learn how to connect your NodeJS app to MongoDB.

For this, we'll write this code (in the next lecture):

const client = await MongoClient.connect('mongodb://localhost:27017');
When using NodeJS 18 (or higher), this code may fail. If that's the case, simply try:

const client = await MongoClient.connect('mongodb://127.0.0.1:27017');

*/