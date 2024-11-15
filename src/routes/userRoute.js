const express = require("express")
const userRoute = express.Router()
const userControllers = require("../controllers/userControllers")
const middleware = require("../middleware/authMiddleware")
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

userRoute.post("/signup", userControllers.userSignup)
userRoute.post("/login", userControllers.userLogin)
userRoute.post("/logout", middleware.verifyToken, userControllers.userLogin)
userRoute.get("/profile/:id", middleware.verifyToken, userControllers.userProfile)
userRoute.post("/follow", middleware.verifyToken, userControllers.followUser)
userRoute.get("/followers/list", middleware.verifyToken, userControllers.getFollowersList)
userRoute.get("/followings/list", middleware.verifyToken, userControllers.getFollowingsList)
userRoute.post("/unfollow", middleware.verifyToken, userControllers.unFollowUser)
userRoute.post("/updateProfilePic", middleware.verifyToken, upload.single('file'), userControllers.updateProfilePic)

module.exports = userRoute