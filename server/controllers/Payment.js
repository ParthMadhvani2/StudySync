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

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        return res.json({
            success:true,
            courseName:course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount:paymentResponse.amount,
        })
    }
    catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:"Could not initiate error",
        });
    }
    // return response

 };


 // verify signature of razorpay and server
 exports.verifySignature = async(req,res) => {
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(!signature === digest){
        console.log("Payment is Authorised");


        const {courseId,userId} = req.body.payload.payment.entity.notes;

        try{
            //fulfil the action
            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {$push:{studentsEnrolled: userId}},
                                            {new:true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course not found",
                });
            }

            console.log(enrolledCourse);

            //find the student and add course to their list enrolled courses me
            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id:userId},
                                            {$push:{courses:courseId}},
                                            {new:true},
            );
            
            console.log(enrolledStudent);
        
            //send mail of the confirmation
            const emailResponse = await mailSender(
                                            enrolledStudent.email,
                                            "Congratulations from Hackerspace",
                                            "Congratulations, you are onboard into new Javascript Course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature verified and Course added"
            });
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid request",
        });
    }
 };
