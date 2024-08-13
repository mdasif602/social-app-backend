const express = require("express")
const commentRoute = express.Router()
const commentControllers = require("../controllers/commentControllers")
const middleware = require("../middleware/authMiddleware")

commentRoute.post("/add", middleware.verifyToken, commentControllers.addComment)

module.exports = commentRoute