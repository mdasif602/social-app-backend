const express = require("express")
const userRoute = express.Router()
const userControllers = require("../controllers/userControllers")
const middleware = require("../middleware/authMiddleware")

userRoute.post("/signup", userControllers.userSignup)
userRoute.post("/login", userControllers.userLogin)
userRoute.get("/profile/:id", middleware.verifyToken, userControllers.userProfile)
userRoute.post("/follow", middleware.verifyToken, userControllers.followUser)
userRoute.get("/followers/list", middleware.verifyToken, userControllers.getFollowersList)
userRoute.get("/followings/list", middleware.verifyToken, userControllers.getFollowingsList)
userRoute.post("/unfollow", middleware.verifyToken, userControllers.unFollowUser)

module.exports = userRoute