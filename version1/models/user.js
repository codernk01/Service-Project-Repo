var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    firstname : String,
    lastname : String,
    email : String,
});

module.exports = mongoose.model("User", userSchema);