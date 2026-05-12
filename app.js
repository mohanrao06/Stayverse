const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 8000;
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const MONGO_URL = "mongodb://127.0.0.1:27017/stayverse"
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("MongoDB connection is successfull....")
}).catch(err=>{
    console.log(err);
})



app.get("/",(req,res)=>{
    res.send("hello i am root...");
})

app.use("/listings",listings)
app.use("/listings/:id/reviews",reviews)
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found !"));
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Somthing went wrong!.."} = err;
    // res.status(statusCode).send(message)
    res.status(statusCode).render("listings/error.ejs",{message})
})
app.listen(port,()=>{
    console.log("App is running in port number "+port);
})