const express = require("express")
const userRoute = express.Router()
const userControllers = require("../controllers/userControllers")
const middleware = require("../middleware/authMiddleware")

userRoute.post("/signup", userControllers.userSignup)
userRoute.post("/login", userControllers.userLogin);
userRoute.get("/profile/:id", middleware.verifyToken, userControllers.userProfile);


module.exports = userRoute