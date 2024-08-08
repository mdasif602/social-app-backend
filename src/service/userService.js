const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const app_constant = require("../constants/app.json");
const jwt = require("jsonwebtoken")
require("dotenv").config()

exports.userSignUp = async (data) => {
    //for Unique Email check
    const { email, password } = data;
    const user_data = await userModel.findOne({ email });
    if (user_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Email Already Exists",
            result: {},
        }
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(data.password, salt);

    const addUser = await userModel.create({ ...data, password: hashPassword });
    return {
        success: 1,
        status: app_constant.SUCCESS,
        message: "user added successfully",
        result: addUser,
    };
};

exports.userLogin = async (data) => {
    const { email, password } = data;

    const user_data = await userModel.findOne({ email });
    console.log(user_data.email);

    if (!user_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Email does not exist!",
            result: {},
        };
    }

    const password_check = await bcrypt.compare(password, user_data.password);

    if (!password_check) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Invalid Credentials!",
            result: {},
        };
    }
    
    const token = jwt.sign({id : user_data._id}, process.env.JWT_SECRET_KEY)
    return {
        success: 1,
        status: app_constant.SUCCESS,
        message: "user loggedin successfully",
        result: user_data,
        token : token
    };
};

exports.userProfile = async (data) => {
    const {id} = data
    const user_data = await userModel.findById(id)

    if (!user_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "User doesn't Exists",
            result: {},
        };
    }

    return {
        success: 1,
        status: app_constant.SUCCESS,
        message: "User found",
        result: user_data,
    };
}