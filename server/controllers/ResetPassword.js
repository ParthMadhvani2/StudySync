const User = require("../models/User");
const mailSender = require("../utlis/mailSender");
const bcrypt = required("bcrypt");

//reset Password token
exports.resetPasswordToken = async (req,res) => {
    try{
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
            const token = crypto.randomUUID();
            // update to user by adding token and expiration time
            const updatedDetails = await User.findOneAndUpdate(
                                                            {email:email},
                                                            {
                                                                token:token,
                                                                resetPasswordExpires: Date.now() + 5*60*1000,
                                                            },
                                                            {new:true});//by adding this new:true the updated document will come
            // create url
            const url = `http://localhost:3000/update-password/${token}`
            // send mail containing url
            await mailSender(email,"Password Reset Link",`Password Reset Link ${url}`);
            // return response
            return res.json({
                success:true,
                message:"Email sent successfully, please check email and change password",
            });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending reset password mail",
        });
    }
};


//reset Password
exports.resetPassword = async (req,res) => {
    try{
            // data fetch
            const {password, confirmPassword, token} = req.body;
            // validation
            if(password !== confirmPassword){
                return res.json({
                    success:false,
                    message:"Passwords do NOT match, please try again!",
                });
            }
            // get user details from db using token
            const userDetails = await user.findOne({token:token});
            // if no entry invalid token 
            if(!userDetails){
                return res.json({
                    success:false,
                    message:"Token is Invalid",
                });
            }
            // time expired
            if(userDetails.resetPasswordExpires < Date.now()){
                return res.json({
                    success:false,
                    message:"Token is expired, Please regenerate token",
                });
            }
            // hashed password
            const hashedPassword = await bcrypt.hash(password,10);
            // password update
            await User.findByIdAndUpdate(
                {token: token},
                {password:hashedPassword},
                {new:true}
            ); 
            // return response
            return res.status(200).json({
                success:true,
                message:"Password reset successfully",
            });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending reset password mail",
        });
    }
};