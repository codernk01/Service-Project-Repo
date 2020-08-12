var mongoose = require("mongoose");
var ServiceProvider = require("./serviceProvider");

var serviceSchema = new mongoose.Schema({
    appliance : String,
    description : String,
    price :Number,
    provider : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "ServiceProvider",
        }
    ],
});

module.exports = mongoose.model("Service", serviceSchema);