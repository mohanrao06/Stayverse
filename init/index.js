const Listing = require("../models/listing.js")
const initdata = require("./data.js");
const mongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/stayverse"
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("MongoDB connection is successfull....")
}).catch(err=>{
    console.log(err);
})

const initDB=async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data)
    console.log("data was intialized...");
}
initDB();