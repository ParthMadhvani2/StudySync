const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //section create
        const newSection = await Section.create({sectionName});
        //update course with section objectID
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message,
        });
    }
};

// Update Section
exports.updateSection = async (req,res) =>{
    try{
        //data input 
        const {sectionName,sectionId} = req.body;
        //data validation
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

        //return response
		res.status(200).json({
			success: true,
			message: section,
		});
    }
    catch(error){
        console.error("Error updating section:", error);
        return res.status(500).json({
            success:false,
            message:"Unable to create section, please try again",
            error:error.message,
        });
    }
};

//delete section
exports.deleteSection = async(req,res) => {
    try{
        //get id assuming we are sending to params
        const {sectionId} = req.params;
        //use findbyIdanddelete
        await Section.findByIdAndDelete(sectionId);
        //[testing] do we need to delete the course schema from data?
        //return response
        return res.status(200).json({
            success:true,
            message:"Section deleted",
        });
    }
    catch(error){
        console.error("Error deleting section:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message,
        });
    }
};