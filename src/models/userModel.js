const {Schema, model, default: mongoose} = require("mongoose")

const UserSchema = new Schema({
    username : {
        type : String,
        required : true,
        min : 6,
        max : 30
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    token : {
        type : String,
        default : ""
    },
    bio : {
        type : String,
        default : ""
    },
    profile_pic : {
        type : String,
        default : ""
    },
    followers : [{
        type : mongoose.Schema.ObjectId, 
        ref : "user"
    }],
    followings : [{
        type : mongoose.Schema.ObjectId,
        ref : "user"
    }]
})

const User = model('user', UserSchema)

module.exports = User