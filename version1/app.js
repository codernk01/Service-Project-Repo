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
var upload = multer({dest:'uploads/'});

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
    console.log(req.query.search);
    if(req.query.search){
        Service.find({type : {
            $regex : new RegExp(req.query.search,'i')
        }}).populate("provider").exec(function(err,data){
            if(err){
                console.log(err);
            }
            else{
                //console.log(data);
                res.render("searchpage",{results:data});
                
                //res.render("index");
            }
        })
    }
    else{
        res.render("index");
    }
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
app.get("/provider",function(req,res){
    res.render("partner-page");
})
//LOGIN-REGISTER
app.get("/providerloginregister",function(req,res){
    res.render("provider_login_register");
})
//REGISTER
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
//LOGIN
app.post("/providerlogin", passport.authenticate("provider-local") ,function(req,res){
    //console.log(req.user);
    res.redirect("/provider/"+req.user._id);
    
});
//AFTER PROVIDER LOGIN-SERVICE PROVIDER PAGE
app.get("/provider/:id",function(req,res){

    ServiceProvider.findById(req.params.id).populate("servicesProviding").exec(function(err,foundProvider){
        if(err)
        {
            console.log(err);

        }
        else{
            if(foundProvider)
            {
                
                res.render("serviceprovider",{currentUser : foundProvider});
            }
            else{
                console.log("provider not found");
                res.redirect("/providerloginregister");
            }
        }
    })
});

app.post("/provider/:id", upload.single('photo'),function(req,res){
    if(!req.file){
    console.log("No filr rec");
    }
    else{
    console.log("file rec");
    console.log(req.file);
    }
});


//SERVICE PROVIDER PROFILE UPDATE
app.get("/provider/:id/edit" ,function(req,res){
    
    ServiceProvider.findById(req.params.id, function(err,foundProvider){
    if(err)
    {
        console.log(err);
    }
    else{
        //console.log(foundProvider);
        if(foundProvider)
        {
        res.render("editprofile", {provider: foundProvider});
        }
        else
        {
            res.redirect("/providerloginregister");
        }
    }
    })
});
//PUT REQUEST FOR PROFILE UPDATE
app.put("/provider/:id",function(req,res){
    ServiceProvider.findByIdAndUpdate(req.params.id,req.body.provider,function(err,updatedprovider){
        if(err)
        {
            console.log(err);
        }
        else{
            if(updatedprovider)
            {
                res.redirect("/provider/"+updatedprovider._id);
            }
            else{
                console.log("profile not updated");
                res.redirect("/provider/"+req.params.id);
            }
        }
    })
})
//ADD SERVICES FOR PROVIDER
app.get("/provider/:id/addservice",function(req,res){
    res.render("addservice",{providerId :req.params.id});
})
app.post("/provider/:id/addservice",function(req,res){
    var service = new Service({
        type : req.body.type,
        appliance : req.body.appliance,
        description : req.body.description,
        price : req.body.price,
    });
    Service.create(service,function(err,addedservice){
        if(err)
        {
            console.log(err);
        }
        else{
            if(addedservice)
            {
                //console.log(addedservice);
                ServiceProvider.findById(req.params.id,function(err,foundprovider){
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        if(foundprovider)
                        {
                            foundprovider.servicesProviding.push(addedservice);
                            foundprovider.save();
                            addedservice.provider.push(foundprovider);
                            addedservice.save();
                            //console.log(foundprovider);
                            //console.log(addedservice);
                            res.redirect("/provider/"+req.params.id);
                        }
                        else{
                            console.log("provider not found");
                            res.redirect("/provider/"+req.params.id);
                        }
                    }
                })
            }
            else{
                console.log("service not added");
                res.redirect("/provider/"+req.params.id);
            }
        }
    })
})
// update service 
app.get("/provider/:id/:serviceid/edit",function(req,res){
    Service.findById(req.params.serviceid,function(err,foundservice){
        if(err){
            console.log(err);
        }
        else{
            if(foundservice){
                res.render("editservice",{service : foundservice, id :req.params.id});
            }
            else{
                console.log("service not found");
                res.redirect("/provider/"+req.params.id);
            }

        }
    })
})
app.put("/provider/:id/:serviceid",function(req,res){
    Service.findByIdAndUpdate(req.params.serviceid,req.body.updatedservice,function(err,updated){
        if(err){
            console.log(err);
        }
        else{
            if(updated){
                res.redirect("/provider/"+req.params.id);
            }
            else{
                console.log("service not updated");
                res.redirect("/provider/"+req.params.id);
            }
        }
    })
})
//delete service
app.delete("/provider/:id/:serviceid/delete",function(req,res){
    Service.findByIdAndDelete(req.params.serviceid,function(err,deletedservice){
        if(err){
            console.log(err);
        }
        else{
            if(deletedservice){
                console.log("service deleted");
                res.redirect("/provider/"+req.params.id);
            }
            else{
                console.log("service not deleted");
                res.redirect("/provider/"+req.params.id);
            }
        }
    })
})
app.listen(8080,function(){
    console.log("Running at localhost:8080");
})

