const { mongoose } = require("mongoose");
const app_constant = require("../constants/app.json");
require("dotenv").config()
const cloudinary = require("../helpers/cloudinary")
const postModel = require("../models/postModel")
const commentModel = require("../models/commentModel")


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


    const comments = await commentModel.find({ post_id: post_id });

    if (comments) {
        return {
            success : 0,
            status : app_constant.BAD_REQUEST,
            message : "Comment fetch success",
            result : comments
        }
    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Something Went Wrong', 
        result: {}
    }
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