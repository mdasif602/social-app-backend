const express = require("express")
require("dotenv").config()
const connection = require("./src/db/connect")
const userRoute = require("./src/routes/userRoute")
const app = express()

app.use(express.json())
app.use("/user", userRoute)
app.listen(process.env.PORT, () => {
    console.log(`Running on server ${process.env.PORT}`)
})