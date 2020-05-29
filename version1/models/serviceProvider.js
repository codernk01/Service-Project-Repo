var mongoose = require("mongoose");
// var service = require("./models/service");
var category = require("./category");

var serviceProviderSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    phone_no: String,
    cat :[
        {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category",
        }
    ],
});

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);