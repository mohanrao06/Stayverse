const express = require("express");
const router = express.Router();
const {listingSchema} = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js")
const Listing = require("../models/listing.js")
const {isLoggedIn,isOwner,validateListing} = require("../middlewares.js");




//Index Route....
router.get("/",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs",{allListings})
}))


//New Route...

router.get("/new",isLoggedIn,(req,res)=>{

    
    res.render("listings/new.ejs");
})

// Show Route...
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
   
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
     if(!listing){
        req.flash("error","Listing you requested for does not exits!");
        return res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing});
}))

// Create Route

router.post("/",isLoggedIn,validateListing,wrapAsync (async (req,res,next)=>{
    let result = listingSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    const newlisting = new Listing (req.body.listing);
    newlisting.owner=req.user._id;
    await newlisting.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings")
    
    
}))

// Edit route...
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exits!");
        return res.redirect("/listings")
    }
    res.render("listings/edit.ejs",{listing});
}))

// update route

router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);

    if (typeof req.body.listing.image === "string") {
        req.body.listing.image = { url: req.body.listing.image };
        }
    let result = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}))

// Delete Routee...
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect(`/listings`);
}))

module.exports=router;