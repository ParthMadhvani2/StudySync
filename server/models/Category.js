const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
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
// Export the Tags model
module.exports = mongoose.model("Category",categorySchema);