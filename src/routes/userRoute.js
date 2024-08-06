const express = require("express")
const userRoute = express.Router()
const userControllers = require("../controllers/userControllers")


userRoute.post("/signup", userControllers.userSignup)
userRoute.post("/login", userControllers.userLogin);


module.exports = userRoute