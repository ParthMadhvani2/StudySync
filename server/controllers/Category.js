const Category = require("../models/Category");

// create tag handler function

exports.createCategory = async (req,res) => {
    try{
        //fetch data
        const {name, description} = req.body;
        // validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //create entry in DB
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:"Category created successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

// getAll Category handler function

exports.showAllCategory = async (req,res) => {
    try{
        const allCategory = await Tag.find({}, {name:true, description:true});
        res.status(200).json({
            success:true,
            message:"all category return successfully",
            allCategory,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};