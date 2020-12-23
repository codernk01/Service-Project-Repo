const express = require('express');
const router = express.Router();
var ServiceProvider = require("../models/serviceProvider");
var passport = require("passport");
var localStrategy = require("passport-local");

router.use(passport.initialize());
router.use(passport.session());

passport.use("provider-local",new localStrategy(ServiceProvider.authenticate()));
passport.serializeUser(ServiceProvider.serializeUser());
passport.deserializeUser(ServiceProvider.deserializeUser());

//LOGIN-REGISTER
router.get("/providerloginregister",function(req,res){
    res.render("progressbar");
    //res.render("provider_login_register");
})
//REGISTER
router.post("/providerregister",function(req,res){
    var newProvider= new ServiceProvider({
        username: req.body.username, 
        firstname:req.body.firstname,
        lastname: req.body.lastname,
        phone_no:req.body.phone_no,
        address:req.body.address,
        profession : req.body.profession,
        city : req.body.city,
        pincode : req.body.pincode
        });
    ServiceProvider.register(newProvider,req.body.password,function(err,serviceprovider){
        if(err){
            console.log(err);
            return res.render("provider_login_register");
        }
        passport.authenticate("provider-local")(req,res,function(){
            res.redirect("/provider/"+serviceprovider._id);
            });
    });
});
//LOGIN
router.post("/providerlogin", passport.authenticate("provider-local") ,function(req,res){
    console.log(req.user);
    res.redirect("/provider/"+req.user._id);
    
});

module.exports = router;