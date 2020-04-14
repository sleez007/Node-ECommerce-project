
const mongoDb =  require("mongodb");
const getDb = require('../util/database').getDb;

module.exports = class User{
    constructor(name, email,cart,id){
        this.name = name;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save(){
        const db = getDb();
       return db.collection("users").insertOne(this);
    }

    addToCart(product){
        const cartProductIndex  = this.cart.items.findIndex(prod =>prod.productId.toString() === product._id.toString() ); 
        let newQuantity = 1; 
        const updatedCartItems = [...this.cart.items];
        if(cartProductIndex  >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity+1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }else{
            updatedCartItems.push({productId : new mongoDb.ObjectId(product._id) , quantity : newQuantity});
        }
       
        const updatedCart = {items : updatedCartItems};
        const db = getDb();
        return db.collection("users").updateOne({_id : new mongoDb.ObjectId(this._id)},{$set : {cart : updatedCart}})
    }

    static findById(id){
        const db = getDb();
        //The reason why we call next is because the find method returns a cursor
        return db.collection("users").findOne({_id : new mongoDb.ObjectId(id)});
    }

    getCart(){
        const db = getDb();
        const  productIds = this.cart.items.map(p=>p.productId)
        return db.collection('products').find({_id : {$in : productIds}}).toArray()
        .then(products=>products.map(p=>({...p, quantity : this.cart.items.find(i=>{
            return i.productId.toString() === p._id.toString()
        }).quantity})))
    }

    deleteItemFromCart(productId){
        const updatedCartItems = this.cart.items.filter(item=> item.productId.toString() !== productId);
        const db = getDb();
        return db.collection("users").updateOne({_id : new mongoDb.ObjectId(this._id)},{$set : {cart : {items : updatedCartItems }}})
    }

    addOrders(){
        const db = getDb();
        return db.collection("orders").insertOne(this.cart).then().catch(e=>console.log(e))
    } //
    //bbn


}