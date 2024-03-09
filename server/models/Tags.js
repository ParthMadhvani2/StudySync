const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
});

module.exports = mongoose.model("Tags",tagsSchema);