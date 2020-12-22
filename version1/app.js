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
//var upload = multer({dest:'uploads/'});

var crypto = require("crypto");
var path = require("path");
var GridFsStorage = require("multer-gridfs-storage");

var app = express();
let gfs;
const mongoUrl = "mongodb://localhost/tudu";
mongoose.connect("mongodb://localhost/tudu",{
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function(err,res){
    if(err){
        console.log("error");
    }
    else{
        
        console.log("database running");
    }
});
const conn = mongoose.connection;
//gfs
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});
//storage
const storage = new GridFsStorage({
    url: mongoUrl,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
      });
    }
});
  
const upload = multer({
   storage
});
// app.use(multer({dest:'./uploads/', rename: function(fieldname,filename){
//     return filename;
//     },
// }))

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

//User routes

app.post("/register",function(req,res){
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

app.get("/loginregister",function(req,res){
    //console.log("Ams");
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
    res.render("progressbar");
    //res.render("provider_login_register");
})
//REGISTER
app.post("/providerregister",function(req,res){
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
app.post("/providerlogin", passport.authenticate("provider-local") ,function(req,res){
    console.log(req.user);
    res.redirect("/provider/"+req.user._id);
    
});

//AFTER PROVIDER LOGIN-SERVICE PROVIDER PAGE
app.get("/provider/:id",function(req,res){
    ServiceProvider.findById(req.params.id).populate("servicesProviding").exec(function(err,foundProvider){
        if(err)
            console.log(err);
        else{
            if(foundProvider){
                if(!gfs) {
                    console.log("some error occured, check connection to db");
                    res.send("some error occured, check connection to db");
                    process.exit(0);
                }
                gfs.find().toArray((err, files) => {
                    // check if files
                    if (!files || files.length === 0) {
                      return res.render("provider-profile", {
                          currentUser : foundProvider,
                         files: false
                      });
                    } else {
                      const f = files
                        .map(file => {
                          if (
                            file.contentType === "image/png" ||
                            file.contentType === "image/jpeg"
                          ) {
                            file.isImage = true;
                          } else {
                            file.isImage = false;
                          }
                          return file;
                        })
                        .sort((a, b) => {
                          return (
                            new Date(b["uploadDate"]).getTime() -
                            new Date(a["uploadDate"]).getTime()
                          );
                        });
                
                        res.render("provider-profile",{currentUser : foundProvider , files : f});
                    }
                });
            } else{
                console.log("get-provider not found");
                res.redirect("/providerloginregister");
            }
        }
    })
});

app.get("/image/:filename", (req, res) => {
    // console.log('id', req.params.id)
    const file = gfs
      .find({
        filename: req.params.filename
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({
            err: "no files exist"
          });
        }
        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
    return file;
});

app.post("/provider/:id", upload.single('photo'),function(req,res){
    if(!req.file){
        console.log("No filr rec");
    }
    else{
    
        console.log(req.file.filename);
        console.log("id "+req.params.id);
        ServiceProvider.findById(req.params.id).populate("servicesProviding").exec(function(err,foundProvider){
            if(err)
                console.log(err);
            else{
                if(foundProvider)
                {
                    res.redirect("/provider/"+req.params.id);
                }
                else{
                    console.log("post--provider not found");
                    res.redirect("/providerloginregister");
                }
            }
        })
           
    }
});


//SERVICE PROVIDER PROFILE UPDATE
app.get("/provider/:id/edit" ,function(req,res){
    
    // ServiceProvider.findById(req.params.id, function(err,foundProvider){
    ServiceProvider.findById(req.params.id).populate("servicesProviding").exec(function(err,foundProvider){
    if(err)
    {
        console.log(err);
    }
    else{
        //console.log(foundProvider);
        if(foundProvider)
        {
             res.render("provider-update", {id :req.params.id, provider: foundProvider});
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
// app.get("/provider/:id/addservice",function(req,res){
//     console.log(req.params.id);
//     // res.render("addservice",{providerId :req.params.id});
// })   
app.post("/provider/:id/addservice",function(req,res){
    var service = new Service({
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

