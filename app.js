const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 8000;
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStartegy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
 
const sessionOptions ={
    secret:"mysupersecretstring",
    resave: false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }

}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("hello i am root...");
})


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStartegy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const MONGO_URL = "mongodb://127.0.0.1:27017/stayverse"
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("MongoDB connection is successfull....")
}).catch(err=>{
    console.log(err);
})


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
})


// app.get("/demouser",async(req,res)=>{
//     let fakeuser = new User({
//         email:"venkey@gmail.com",
//         username: "venky"
//     })

//     const newUser = await User.register(fakeuser,"hello");
//     res.send(newUser);
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


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