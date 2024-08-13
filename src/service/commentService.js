const { mongoose } = require("mongoose");
const app_constant = require("../constants/app.json");
require("dotenv").config()
const cloudinary = require("../helpers/cloudinary")
const postModel = require("../models/postModel")
const commentModel = require("../models/commentModel")

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