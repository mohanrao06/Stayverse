const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://images.pexels.com/photos/30899536/pexels-photo-30899536.jpeg",
        }
    },
    price : Number,
    location: String,
    country : String
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;