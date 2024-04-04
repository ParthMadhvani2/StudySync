const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender =require("../utlis/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");

// cpature tha payment and initiate the razorpay order
 exports.capturePayment = async(req,res) => {
    // get both courseId and userId
    const {course_id} = req.body;
    const userId = req.user.id;
    // validation

        // valid courseId
        if(!course_id){
            return res.json({
                success:false,
                message:"Please Provide valid course ID",
            });
        }
        // valid courseDetail
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:"Could not find the course",
                });
            }
            
            // user already pay for the same course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"Student is already enrolled"
                });
            }
        }
    catch(error){
        console.error(error);
        return res.staus(500).json({
            success:false,
            message:"error.message",
        });
    }

    // oreder create
    const amount = course.price;
    const currency = "INR";

    const options = {
        aomunt: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: course_id,
            userId,
        }
    };
    // return response

 };