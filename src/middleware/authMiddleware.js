const jwt = require("jsonwebtoken")
require("dotenv").config()
const validationHelper = require("../helpers/validation");
const UserModel = require("../models/userModel")
const constants = require("../constants/app.json")

exports.verifyToken = async (request, response, next) => {
    // console.log(request.headers);  
    const {authorization} = request.headers 
    if (!authorization) {
        return response.json({
           success : 0,
           message : "Provide right token"
        })
    }
    const token = authorization.split(' ')[1]
    // console.log(token);
    const verify_token = jwt.verify(token, process.env.JWT_SECRET_KEY)
    // console.log(verify_token);
    if (!verify_token) {
        return response.json({
            success : 0,
            message : "Provide right token"
         })
    }
    const {id} = verify_token
    const user = await UserModel.findById(id)
    if (!user) {
        return res.json({ 
            success: 0, 
            status: constants.BAD_REQUEST, 
            message: 'User does not exist!', result: {} })
    }
    request.user = user
    next()
    
    
}