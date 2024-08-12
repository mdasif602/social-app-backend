const {Schema, model} = require('mongoose')


const commentSchema = new Schema({
    text : {
        type : String,
        required : true
    },
    user_id : {
        type : mongoose.Schema.ObjectId, 
        ref : "user",
        required : true
    },
    likes : [{
        type : mongoose.Schema.ObjectId, 
        ref : "user",
        default : []
    }],
    
}, {timestamps : true})


const Comment = model('post', commentSchema)
module.exports = Comment