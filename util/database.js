const mongoDb = require('mongodb');
const MongoClient = mongoDb.MongoClient;

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'devs'

let _db ; 

const mongoConnect = (callback)=>{
    MongoClient.connect(connectionURL,{useNewUrlParser:true,useUnifiedTopology: true})
    .then(client=>{
        console.log("Connected");
        _db = client.db(databaseName)
        callback()
    })
    .catch(e=>console.log(e));
}

const getDb= ()=>{
    if(_db){
        return _db
    }

    throw "No Database found!"

}


exports.mongoConnect = mongoConnect;
exports.getDb = getDb;




   