var mongoose = require("mongoose");
var Service = require("./service");
var passportLocalMongoose = require("passport-local-mongoose");

var serviceProviderSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,       //email
    phone_no: Number,
    address: String,
    password: String,
    profession : String,
    imgsrc : String,
    city : String,
    pincode : Number,
    servicesProviding :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Service",
        }
    ],

});

serviceProviderSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);