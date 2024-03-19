const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res){
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
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                courseId,
                                                {
                                                    $push:{
                                                        courseContent:newSection._id,
                                                    }
                                                },
                                                {new:true},
                                            );
                                            //todo use populate to replace section and subsection both in updatedCourseDetails
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
            message:"Unable to create section, please try again",
            error:error.message,
        });
    }
}


exports.updateSection = async (req,res) =>{
    try{
        //data input 
        const {sectionName,sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName},{new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section, please try again",
            error:error.message,
        });
    }
}


exports.deleteSection = async(req,res) => {
    try{
        //get id assuming we are sending to params
        const {sectionId} = req.params;
        //use findbyIdanddelete
        await Section.findByIdAndDelete(sectionId);
        //return response
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
            error:error.message,
        });
    }
}