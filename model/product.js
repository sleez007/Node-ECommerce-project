
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title : {type: String,required : true} ,
    price : { type: Number , required : true},
    description : {type : String , required : true},
    imageUrl : { type : String, required : true },
    userId : {
        type : Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
});


module.exports =  mongoose.model('Products',productSchema);
// const mongoDb =  require("mongodb");
// const getDb = require('../util/database').getDb;
// module.exports = class Product{
//     constructor(title, price, description, imageUrl,id, userId){
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl
//         this._id = id ? new mongoDb.ObjectId(this._id) : null;
//         this.userId = userId;
//     }

//     save(){
//         const db  = getDb();
//         if(this._id){
//             return db.collection("products").updateOne({_id : this._id },{$set: this})
//         }else{
//             return db.collection("products").insertOne(this)
//         }
        
//     }

//     static fetchAll(){
//         const db = getDb();
//         return db.collection("products").find().toArray()
//     }

//     static findById(productId){
//         const db = getDb();
//         return db.collection("products").findOne({_id: new mongoDb.ObjectId(productId) }); 
//     }

//     static deleteById(productId){
//         const db = getDb();
//         return db.collection("products").deleteOne({_id : new mongoDb.ObjectId(productId)})
//     }
// }