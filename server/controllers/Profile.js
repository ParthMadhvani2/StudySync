const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.updateProfile = async (req,res) => {
    try{
        //get data
		const { dateOfBirth = "", about = "", contactNumber } = req.body;
        //get userid
		const id = req.user.id;
		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

		// Update the profile fields
		profile.dateOfBirth = dateOfBirth;
		profile.about = about;
		profile.contactNumber = contactNumber;

		// Save the updated profile
		await profile.save();
        //return response
        return res.status(200).json({
            success:true,
            message:"Profile Update Successfully",
            profileDetails,
        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Please try again",
            error:error.message,
        });
    }
};

//delete account

exports.deleteAccount = async (req,res) => {
    try{
        // how can we schedule this deletion operation
		// TODO: Find More on Job Schedule
		// const job = schedule.scheduleJob("10 * * * * *", function () {
		// 	console.log("The answer to life, the universe, and everything!");
		// });
		// console.log(job);

        //get id
        const id = req.user.id;
        //validation
		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.userDetails });
		// TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User
		await user.findByIdAndDelete({ _id: id });
        //return response
        return res.status(200).json({
            success:true,
            message:"User deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message: "User Cannot be deleted successfully" ,
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
        console.log(userDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            data: userDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//updateDisplayPicture