var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


var app = express();

app.use(express.static("views"));
app.set("view engine","ejs");
//for home page
app.get("/",function(req,res){
    res.render("index");
})


app.listen(8080,function(){
    console.log("Running at localhost:8080");
})