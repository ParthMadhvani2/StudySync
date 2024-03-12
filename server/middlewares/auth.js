const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req,res,next) => {
    try{
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");
        // if token missing, then return response
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing",
            });
        }

        //verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user(decode);
        }
        catch(error){
            return res.status(401).json({
                success:false,
                message:"Token is invalid",
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong will validating the token",
        });
    }
}

// isStudent
exports.isStudent = async (req,res,next) => {
    try{
        if (req.user.accoutnType !== "student"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Students Only",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,please try again",
        });
    }
}

// isInstructor
exports.isInstructor = async (req,res,next) => {
    try{
        if (req.user.accoutnType !== "instructor"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Instructor Only",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,please try again",
        });
    }
}

// isAdmin
exports.isAdmin = async (req,res,next) => {
    try{
        if (req.user.accoutnType !== "admin"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Admin Only",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified,please try again",
        });
    }
}