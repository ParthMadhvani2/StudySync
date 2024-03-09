const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true,
    },
    otp:{
        type:String,
        require:true,
    },
    createAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    },
});

// a function -> to send emails
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion",otp);
        console.log("Email send successfully:", mailResponse);
    }
    catch(error){
        console.log("error has occured while sending mails with otp",error);
        throw error;

    }
}

OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);