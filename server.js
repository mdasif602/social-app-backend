const express = require("express")
require("dotenv").config()
const connection = require("./src/db/connect")
const userRoute = require("./src/routes/userRoute")
const postRoute = require("./src/routes/postRoute")
const commentRoute = require("./src/routes/commentRoute")
const thirdpartyRoute = require("./src/routes/thirdpartyRoute")
const app = express()
var cors = require('cors')
app.use(cors());



app.use(express.json())
app.use("/user", userRoute)
app.use("/post", postRoute)
app.use("/post/comment", commentRoute)
app.use("/api", thirdpartyRoute)

app.listen(process.env.PORT, () => {
    try {
         connection;
         console.log(`Running on server ${process.env.PORT}`)
    } catch (error) {
        console.log(error);
        
    }
})