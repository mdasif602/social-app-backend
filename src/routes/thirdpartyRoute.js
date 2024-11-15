const express = require("express")
const thirdpartyRoute = express.Router()
const thirdpartyControllers = require("../controllers/thirdpartyController")
const middleware = require("../middleware/authMiddleware")

thirdpartyRoute.get("/currency",  thirdpartyControllers.getCurrency)

module.exports = thirdpartyRoute