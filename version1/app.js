var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var User = require("./models/user");
var ServiceProvider = require("./models/serviceProvider");
var Service =require("./models/service");
var methodOverride = require("method-override");
var multer= require("multer");
const providerRoutes = require('./routes/provider');
const userAuthRoutes = require('./routes/userAuth');
const providerAuthRoutes = require('./routes/providerAuth');

var app = express();

app.use(express.static("views"));
app.set("view engine","ejs");
app.use(require("express-session")({
    secret: "This project have it's root in Neelansh's head",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

app.get("/",function(req,res){
    console.log(req.query.search);
    let regex = new RegExp(req.query.search,'i');
    if(req.query.search){
        ServiceProvider.find({
            $or: [
                {'firstname': regex},
                {'lastname': regex},
                {'username': regex},
                {'address': regex},
                {'profession': regex},
            ]
        }).populate("servicesProviding").exec(function(err,data){
            if(err){
                console.log(err);
            }
            else{
                console.log(data);
                res.render("search-result",{results :data});
                //res.redirect("/");
            }
        })
    }
    else{
        res.render("index");
    }
})

//ROUTES
app.use('/', userAuthRoutes)
app.use('/',providerAuthRoutes)
app.use('/', providerRoutes)

app.listen(8080,function(){
    console.log("Running at localhost:8080");
})

