const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config;

//send OTP
exports.sendOTP = async (req,res) => {
    try{
    
        // fetch email from request body
        const {email} = req.body;

        //check if user already exists
        const checkUserPresent = await User.findOne({email});

        //if already exists, then return response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already registered",
            })
        }

        //generate otp (I have used a bad logic for unique OTP generation but further I would prefer to use a unique OTP generate library)
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated :",otp);

        //check unique otp or not
        let result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
        }

        const otpPayload = {email,otp};

        // create an entry for OTP in DB
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successfully
        res.status(200).json({
            success:true,
            message:"OTP send Successfully",
            otp,
        })
    }
    catch(error){
        console.log("Error has occoured in generating OTP :",error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}

//Signup
exports.signUp = async (req,res) => {
    
    try{

        // data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;
        
        // data validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            });
        }
        
        // match both password
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and Confirm Password values doesn't match, Please try again.",
            });
        }

        // check user already exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is already registered, Please login",
            });
        }

        // find the most resent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("Recent OTP",recentOtp);
        
        // validate OTP
        if(recentOtp.length == 0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:"OTP not found",
            })
        }else if(otp !== recentOtp.otp){
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

        // hashed Password
        const hashedPassword = await bcrypt.hash(password,10);
        
        // Entry create in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        })
        // return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
        });
    }
    catch(error){
        console.log("Error has occured in signup :",error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered, please try again",
        });
    }
}

//login
exports.login = async (req,res) => {
    try{
        // get data from request body
        const {email,password} = req.body;

        // validation of data
        if(!email || !password){
            return res.status(403).json({
                success:true,
                message:"Please fill details correctly, please try again",
            });
        }

        // check user exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });
        }

        // generate JWT, after match of password
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                role :user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;
            
            // create cookie and send response
            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged In successfully",
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
            });
        }


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"login faliure, please try again",
        });
    }
};


//change Password
exports.changePassword = async (req,res) => {
    try{
        // get data from request body
        const userDetails = await User.findById(req.user.id);
        
        // get oldPassword, newPassword, confirmPasword
        const {oldPassword, newPassword, confirmNewPassword} = req.body;
        
        // validation old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password,
        );
        if(!isPasswordMatch){
            // If old password does not match, return a 401 (Unauthorized) error
            return res.status(401).json({
                success:false,
                message:"The password is incorrect",
            });
        }
        // Match new password and confirm new password
        if (newPassword !== confirmNewPassword) {
            // If new password and confirm new password do not match, return a 400 (Bad Request) error
            return res.status(400).json({
                success: false,
                message: "The password and confirm password does not match",
            });
        }

        // update password in DB
        const encryptedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password :encryptedPassword},
            {new:true},
        );

        // send mail password updated
        try{
            const emailResponse = await amilSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        }
        catch(error){
            // If there is an error in sending mail, log the error and return a 500 (Internal Server Error) error
            console.log("Error occured while sending the email: ",error);
            return res.status(500).json({
                success:false,
                message:"Error occured while sending email",
                error: error.message,
            });
        }
        // return success response
        return res.status(200).json({
            success:true,
            message:"Password updated successfully",
        });
    }
    catch(error){
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);

        return res.status(500).json({
            success:false,
            message:"Error occurred while updating password",
            error: error.message,
        });
    }
};