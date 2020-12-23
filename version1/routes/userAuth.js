const express = require('express');
const router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var localStrategy = require("passport-local");


router.use(passport.initialize());
router.use(passport.session());

passport.use("local",new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//User routes
router.post("/register",function(req,res){
    var newUser= new User({
        username: req.body.username, 
        firstname:req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        });
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("login_register");
        }
        passport.authenticate("local")(req,res,function(){
            //console.log("user ---------")
            //console.log(user);
            res.redirect("/");
            });
    });
});

router.get("/loginregister",function(req,res){
    //console.log("Ams");
    res.render("login_register");
});

router.post("/login", passport.authenticate("local") ,function(req,res){
        //console.log(req.user);
        res.redirect("/");
});

router.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

module.exports = router;