const Profile = require("../models/Profile");
const User = require("../models/User");


exports.updateProfile = async (req,res) => {
    try{
        //get data
        const {dateOfBirth="", about="", contactnumber, gender} = req.body;
        //get userid
        const id = req.user.id;
        //validation
        if(!contactnumber || !gender || !id ){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactnumber;
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success:true,
            message:"Profile Update Successfully",
            profileDetails,
        });

    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"Please try again",
            error:error.message,
        });
    }
};

//delete account

// how can we schedule this deletion operation
exports.deleteAccount = async (req,res) => {
    try{
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }
        //delete profile of user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //UnEnroll user from all enroll users
        //cron job
        //delete user
        await User.findByIdAndDelete({_id:id});
        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        });
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};


//get all details of user
exports.getAllUserDetails = async (req,res) => {
    try{
        //get id
        const id = req.user.id;
        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
        });
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message,
        });
    }
};