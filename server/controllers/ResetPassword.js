const User = require("../models/User");
const mailSender = require("../utlis/mailSender");

//reset Password token
exports.resetPasswordToken = async (req,res) => {
    // get req from user body
    const email = req.body.email;
    // check user for this email, email validation
    const user = await User.findOne({email:email});
    if(!user){
        return res.json({
            success:false,
            message:"User not registered with us"
        });
    }
    // generate token
    // update to user by adding token and expiration time
    // create url
    // send mail containing url
    // return response
}


//reset Password