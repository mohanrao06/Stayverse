const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const app = express();
const port = 8000;
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");

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

app.listen(port,()=>{
    console.log("App is running in port number "+port);
})

app.get("/",(req,res)=>{
    res.send("hello i am root...");
})


//Index Route....
app.get("/listings",async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs",{allListings})
})


//New Route...

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// Show Route...
app.get("/listings/:id",async (req,res)=>{
    let {id} = req.params;

    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})


// Create Route

app.post("/listings",async (req,res)=>{
    
    const newlisting = new Listing (req.body.listing);
    await newlisting.save();

    res.redirect("/listings")
})

// Edit route...
app.get("/listings/:id/edit",async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});
})

// update route

app.put("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});

    res.redirect(`/listings/${id}`);
})

// Delete Routee...
app.delete("/listings/:id",async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
})



// app.get("/testListing",async (req,res)=>{
//     let sample = new Listing({
//         title : "my new villa",
//         description : "by the beach..",
//         price : 1299,
//         location : "Punjab",
//         country : "India",
//     })
//     await sample.save();
//     console.log("sample was saved");
//     res.send("success...")
// })