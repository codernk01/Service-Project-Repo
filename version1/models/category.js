var mongoose = require("mongoose");
var service = require("./service");

var categorySchema = new mongoose.Schema({
    cat : String,
    serv :[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref : "service",
        }
    ]
});

module.exports = mongoose.model("Category", categorySchema);