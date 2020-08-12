var mongoose = require("mongoose");
var Service = require("./service");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    username : String,  //email
    password : String,
    pastServices : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Service",
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);