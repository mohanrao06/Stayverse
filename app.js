const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const app = express();
const port = 8000;
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js");
const  {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js")


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

const validateListing=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

const validateReview=(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//Index Route....
app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs",{allListings})
}))


//New Route...

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// Show Route...
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;

    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}))


// Create Route

app.post("/listings",validateListing,wrapAsync (async (req,res,next)=>{
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    const newlisting = new Listing (req.body.listing);
    await newlisting.save();
    res.redirect("/listings")
    
    
}))

// Edit route...
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});
}))
// update route

app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    if (typeof req.body.listing.image === "string") {
        req.body.listing.image = { url: req.body.listing.image };
        }
    let result = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    
    res.redirect(`/listings/${id}`);
}))

// Delete Routee...
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings`);
}))


// Post REVIEWS post route

app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review)
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}))

//Delete Review route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}})
    await Review.findById(reviewId);

     res.redirect(`/listings/${id}`)

}))





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