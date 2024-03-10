const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");

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
    
}


//change Password