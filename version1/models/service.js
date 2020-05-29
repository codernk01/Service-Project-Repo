var mongoose = require("mongoose");

var serviceSchema = new mongoose.Schema({
    serv : String,
});

module.exports = mongoose.model("Service", serviceSchema);