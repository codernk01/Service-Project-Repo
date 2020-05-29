var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var User = require("./models/user");
var ServiceProvider = require("./models/serviceProvider");

var app = express();

mongoose.connect("mongodb://localhost/tudu", function(err,res){
    if(err)
    {
        console.log("error");
    }
    else{
        console.log("database running");
    }
});

app.use(express.static("views"));
app.set("view engine","ejs");

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "This project have it's root in Neelansh's head",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

app.get("/",function(req,res){
    res.render("index");
})

//User routes
app.get("/register",function(req,res){
    res.render("register");
})

app.post("/register",function(req,res){
    var newUser= new User({
        username: req.body.username, 
        firstname:req.body.firstname,
        lastname: req.body.lastname
        });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/");
            });
    });
});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login", passport.authenticate("local") ,function(req,res){
        current=req.user;
        res.redirect("/");
});
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

//Service provider Routes

app.listen(8080,function(){
    console.log("Running at localhost:8080");
})

