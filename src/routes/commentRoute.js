const express = require("express")
const commentRoute = express.Router()
const commentControllers = require("../controllers/commentControllers")
const middleware = require("../middleware/authMiddleware")

commentRoute.post("/add", middleware.verifyToken, commentControllers.addComment)
commentRoute.get("/list", middleware.verifyToken, commentControllers.getCommentList)
commentRoute.post("/like", middleware.verifyToken, commentControllers.likeComment)
commentRoute.post("/unlike", middleware.verifyToken, commentControllers.unlikeComment)

module.exports = commentRoute