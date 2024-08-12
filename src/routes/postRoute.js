const express = require("express")
const postRoute = express.Router()
const postControllers = require("../controllers/postControllers")
const middleware = require("../middleware/authMiddleware")
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

postRoute.post("/upload", middleware.verifyToken, upload.single('file'), postControllers.uploadPost)
postRoute.get("/list", middleware.verifyToken, postControllers.getPostList)

module.exports = postRoute