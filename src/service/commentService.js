const { mongoose } = require("mongoose");
const app_constant = require("../constants/app.json");
require("dotenv").config()
const cloudinary = require("../helpers/cloudinary")
const postModel = require("../models/postModel")
const commentModel = require("../models/commentModel");


// API to add a comment
exports.addComment = async (data, user_data) => {
    const {_id} = user_data
    const {post_id, comment} = data
    const parent_id = data.parent_id ? data.parent_id : null
    const post_data = await postModel.findOne({_id : post_id})

    if (!post_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'Post does not exist', result: {}
        }
    }

    if (parent_id) {
        const comment_parent_data = await commentModel.findOne({_id : parent_id})
        if (!comment_parent_data) {
            return {
                success: 0,
                status: app_constant.BAD_REQUEST,
                message: 'Comment does not exist', result: {}
            }
        }
    }

    const add_comment = await commentModel.create({
        text : comment,
        user_id : _id,
        post_id,
        parent_id

    })

    if (add_comment) {
        return {
            success: 1,
            status: app_constant.SUCCESS,
            message: 'Comment added successfully', 
            result: add_comment
        }
    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Something Went Wrong', 
        result: {}
    }
}

// API to get comment list of a post
exports.getCommentList = async (data) => {
    const {post_id} = data

    const post_data = await postModel.findOne({_id : post_id})

    if (!post_data) {
        return {
            success : 0,
            status : app_constant.BAD_REQUEST,
            message : "Post does not exits",
            result : {}
        }
    }

    // let result = []

    // const top_level_comments = await commentModel.find({post_id, parent_id : null})
    // console.log(top_level_comments);
    // result = await Promise.all(top_level_comments.map(async (elem) => {
    //     return {
    //         ...elem['_doc'],
    //         replies : await getreplies(elem)
    //     }
    // }))



    // Another way

    // const comments = await commentModel.find({ post_id: post_id }).populate("user_id", 'username email').sort({updatedAt : -1})
    let result = []

    const comments = await commentModel.aggregate([
        { $match: { post_id: new mongoose.Types.ObjectId(post_id)} },
        {
            $lookup: {
                from: 'users',
                localField: "user_id",
                foreignField: "_id",
                as: "user_details"
            }
        },
        { $unwind: "$user_details" },
        {$sort : {updatedAt : -1}},
        {
            $project: {
                text : 1,
                likes : 1,
                updated : 1,
                parent_id : 1,
                updatedAt : {
                    $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: "$updatedAt",
                            timezone: "Asia/Kolkata"
                        }}, 
                email: "$user_details.email",
                username: "$user_details.username"
            }
        },
    ])

    // console.log(comments);
    

    result = getreplies2(comments, null)


    // console.log("hello", comments);
    
    // let top_level_comments = []

    // top_level_comments = comments.filter((cmt) => (cmt.parent_id === null))

    // console.log(top_level_comments);
    // let result = []

    // result = top_level_comments.map((data) => {
    //     return {
    //         ...data,
    //         replies : getcomment(data)
    //     }
    // })

    // function getcomment(data) {
    //     comments.filter((cmt) =>  )
    // }
    

    if (result) {
        return {
            success : 1,
            status : app_constant.SUCCESS,
            message : "Comment fetch success",
            result
        }
    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Something Went Wrong', 
        result: {}
    }
}

async function getreplies(parent) {
     const parent_id = parent._id
     const replies = await commentModel.find({parent_id})

     const result = await Promise.all(replies.map(async (element) => {
        return {
            ...element['_doc'],
            replies : await getreplies(element)
        }
     }))

     return result
}

function getreplies2 (comments, parent_id) {
    const top_level = comments.filter((e) => String(e.parent_id) === String(parent_id))

    const result = top_level.map(e => (
        {
            ...e,
            replies : getreplies2(comments, e._id)
        }
    ))

    return result
}
// API to like a comment
exports.likeComment = async (data, user_data) => {
   const {comment_id} = data
   const {_id} = user_data

   const comment_data = await commentModel.findOne({_id : comment_id})

   if (!comment_data) {
    return {
        success : 0,
        status : app_constant.BAD_REQUEST,
        message : "Comment does not exists!",
        retult : {}
    }
   }

   const like_check = comment_data.likes.includes(_id)
    if (like_check) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST, 
            message: 'Comment is already liked!', 
            result: {} }
    }

    comment_data.likes.push(_id)

    const update_comment_data = await commentModel.updateOne(
        {_id : comment_id},
        {$set : {likes : comment_data.likes}}
    )

    if (update_comment_data) {
        return { 
            success: 1, 
            status: app_constant.SUCCESS, 
            message: 'Comment liked successfully!', 
            result: {} 
        };
    }

    return { 
        success: 0, 
        status: app_constant.INTERNAL_SERVER_ERROR, 
        message: 'Internal server error!', 
        result: {} 
    }
}

// API to unlike a comment
exports.unlikeComment = async (data, user_data) => {
   const {comment_id} = data
   const {_id} = user_data

   const comment_data = await commentModel.findOne({_id : comment_id})

   if (!comment_data) {
    return {
        success : 0,
        status : app_constant.BAD_REQUEST,
        message : "Comment does not exists!",
        retult : {}
    }
   }

   const like_check = comment_data.likes.includes(_id)

    if (!like_check) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST, 
            message: 'Comment is not liked!', 
            result: {} }
    }

    const filter_existing_likes = comment_data.likes.filter( (element)=> element.toString() !== _id.toString())

    const update_comment_data = await commentModel.updateOne(
        {_id : comment_id},
        {$set : {likes : filter_existing_likes}}
    )

    if (update_comment_data) {
        return { 
            success: 1, 
            status: app_constant.SUCCESS, 
            message: 'Comment unliked successfully!', 
            result: {} 
        };
    }

    return { 
        success: 0, 
        status: app_constant.INTERNAL_SERVER_ERROR, 
        message: 'Internal server error!', 
        result: {} 
    }
}