var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var User = require("./models/user");

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//ROUTES

app.get("/",function(req,res){
    res.render("index");
})

app.get("/register",function(req,res){
    res.render("register");
})

app.post("/register",function(req,res){
    var newUser= new User({
        username: req.body.firstname, 
        email: req.body.email, 
        lastname: req.body.lastname
        });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.redirect("register");
        }
        passport.authenticate("local")(req,res,function(){
                res.redirect("index")
            });
    });
    //res.send("SignUp");
});





app.listen(8080,function(){
    console.log("Running at localhost:8080");
})

