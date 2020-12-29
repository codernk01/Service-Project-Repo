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
var Razorpay=require("razorpay");
const shortid = require("shortid")

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
        Service.find({
            $or: [
                {'appliance': regex},
                {'description': regex},
            ]
        }).then((dataa)=>{
          var promises = [];
          //console.log('dataa:', dataa);
          if(dataa){ 
            //console.log(dataa);
            dataa.forEach((service, i) => {
              service.provider.forEach((providerid, i) => {
                promises.push(
                  new Promise(function(resolve, reject) {
                    ServiceProvider.findById(providerid).populate('servicesProviding').exec((err, data)=>{
                      resolve(data);
                    })
                  })
                )
  
              });
            });
          }
  
          promises.push(
            new Promise(function(resolve, reject) {
              ServiceProvider.find({
                $or: [
                    {'firstname': regex},
                    {'lastname': regex},
                    {'username': regex},
                    {'address': regex},
                    {'profession': regex}
                  ]
                }).populate('servicesProviding').exec((err, data)=>{
                  resolve(data);
                })
              })
            );
         
          Promise.all(promises).then(function(data){
              
              if(0){
  
            }
            else{
                //console.log(data);
                var providers = [];
                data.forEach((result, i) => {
                  if(Array.isArray(result)){
                    result.forEach((item, i) => {
                      providers.push(item);
                    });
                  } else{
                    providers.push(result);
                  }
                });
                
              res.render("search-result",{results :providers});
            }
        })
    });
    }
    else{
        res.render("index");
    }
})

//ROUTES
app.use('/', userAuthRoutes)

app.use('/',providerAuthRoutes)
app.use('/', providerRoutes)

const razorpay = new Razorpay({
    key_id: 'rzp_test_M6RUbvov2eQ4ve', // your `KEY_ID`
    key_secret: 'kkmEXfBb4u0FhcFWq7tnUAJr' // your `KEY_SECRET`
  })

app.get('/payment', function(req,res){
    res.render("PaymentPage");
});

app.post('/razorpay', async (req, res) => {
	const payment_capture = 1
	const amount = 4
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
        console.log(response);
        console.log("------");
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
        })
        //console.log(res);
	} catch (error) {
		console.log("error");
	}
})



app.listen(8080,function(){
    console.log("Running at localhost:8080");
})

