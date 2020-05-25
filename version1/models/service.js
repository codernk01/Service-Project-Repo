var mongoose = require("mongoose");

var serviceSchema = new mongoose.Schema({
    appliance : String,
    price : Number,

});

module.exports = mongoose.model("Service", serviceSchema);