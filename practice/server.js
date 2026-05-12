const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");


const sessionOptions ={
    secret:"mysupersecretstring",
    resave: false,
    saveUninitialized:true,
}
app.use(session(sessionOptions));
app.use(flash())

app.get("/register",(req,res)=>{
    let {name="unknow"}=req.query;
    req.session.name=name;
    req.flash("success","User registed done");
    res.redirect("/hello");
})
app.get("/hello",(req,res)=>{
    res.send(`Hello , ${req.session.name}`);
})
app.listen(3000,()=>{
    console.log("running on 3000");
})