const express = require("express")
const postRoute = express.Router()
const postControllers = require("../controllers/postControllers")
const middleware = require("../middleware/authMiddleware")
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

postRoute.post("/upload", middleware.verifyToken, upload.single('file'), postControllers.uploadPost)
postRoute.get("/list", middleware.verifyToken, postControllers.getPostList)
postRoute.post("/update", middleware.verifyToken, upload.single('file'), postControllers.updatePost)
postRoute.post("/like", middleware.verifyToken, postControllers.likePost)
postRoute.post("/unlike", middleware.verifyToken, postControllers.unlikePost)
postRoute.get("/like/list", middleware.verifyToken, postControllers.getPostLikeList)

module.exports = postRoute