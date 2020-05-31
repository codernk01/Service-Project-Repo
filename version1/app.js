var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var User = require("./models/user");
var ServiceProvider = require("./models/serviceProvider");
var methodOverride = require("method-override");

var app = express();

mongoose.connect("mongodb://localhost/tudu", function(err,res){
    if(err){
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
app.use(methodOverride("_method"));

passport.use("local",new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use("provider-local",new localStrategy(ServiceProvider.authenticate()));
passport.serializeUser(ServiceProvider.serializeUser());
passport.deserializeUser(ServiceProvider.deserializeUser());

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

app.post("/register",function(req,res){
    var newUser= new User({
        username: req.body.username, 
        firstname:req.body.firstname,
        lastname: req.body.lastname
        });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("login_register");
        }
        passport.authenticate("local")(req,res,function(){
            console.log("user ---------")
            console.log(user);
            res.redirect("/");
            });
    });
});

app.get("/loginregister",function(req,res){
   // console.log(req.user);
    res.render("login_register");
});

app.post("/login", passport.authenticate("local") ,function(req,res){
        //console.log(req.user);
        res.redirect("/");
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

//Service provider Routes

app.get("/providerloginregister",function(req,res){
    res.render("provider_login_register");
})

app.post("/providerregister",function(req,res){
    var newProvider= new ServiceProvider({
        username: req.body.username, 
        firstname:req.body.firstname,
        lastname: req.body.lastname,
        phone_no:req.body.phone_no,
        address:req.body.address
        });
    ServiceProvider.register(newProvider,req.body.password,function(err,serviceprovider){
        if(err){
            console.log(err);
            return res.render("provider_login_register");
        }
        passport.authenticate("provider-local")(req,res,function(){
            res.render("serviceprovider");
            });
    });
});

app.post("/providerlogin", passport.authenticate("provider-local") ,function(req,res){
    console.log(req.user);
    console.log(req.user._id);
    res.redirect("/provider/"+req.user._id+"/edit");
});

app.get("/provider/:id/edit" ,function(req,res){
    console.log(req.params.id);
    ServiceProvider.findById(req.params.id, function(err,foundProvider){
    if(err)
    {
        console.log(err);
    }
    else{
        console.log(foundProvider);
        res.render("editprofile", {provider: foundProvider});
    }
    })
});

app.listen(8080,function(){
    console.log("Running at localhost:8080");
})

