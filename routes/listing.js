const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const  {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js")


const validateListing=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}


//Index Route....
router.get("/",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs",{allListings})
}))


//New Route...

router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// Show Route...
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
   
    const listing = await Listing.findById(id).populate("reviews");
     if(!listing){
        req.flash("error","Listing you requested for does not exits!");
        return res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing});
}))

// Create Route

router.post("/",validateListing,wrapAsync (async (req,res,next)=>{
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    const newlisting = new Listing (req.body.listing);
    await newlisting.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings")
    
    
}))

// Edit route...
router.get("/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exits!");
        return res.redirect("/listings")
    }
    res.render("listings/edit.ejs",{listing});
}))
// update route

router.put("/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    if (typeof req.body.listing.image === "string") {
        req.body.listing.image = { url: req.body.listing.image };
        }
    let result = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}))

// Delete Routee...
router.delete("/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect(`/listings`);
}))

module.exports=router;