const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utlis/imageuploader");

//create course handler function
exports.createCourse = async (req,res) => {
    try{
        //fetch data
        const {courseName,courseDescription, whatYouWillLearn, price, category} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ",instructorDetails);
        //to be checked

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",
            });
        }

        //check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category details not found",
            });
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //add the new course to user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        //update the tag ka schema
        await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        );//to be checked

        //return response
        return res.status(200).json({
            success:true,
            data:newCourse,
            message:"Course Created Successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message,
        });
    }
};

//getall courses handler function

exports.showAllCourses = async (req,res) => {
    try{// to be checked
        const allCourses = await Course.find({},{courseName:true,
                                                price:true,
                                                instructor:true,
                                                thumbnail:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true,})
                                                .populate("instructor")
                                                .exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetch successfully",
        });
    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"Not fetch course data",
            error:error.message,
        });
    }
}