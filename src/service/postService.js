const { mongoose } = require("mongoose");
const app_constant = require("../constants/app.json");
require("dotenv").config()
const cloudinary = require("../helpers/cloudinary")
const postModel = require("../models/postModel")

exports.postUpload = async (data, user_data) => {
    // console.log(data);
    const { _id } = user_data
    const { file } = data
    // console.log(_id);
    const file_url = await cloudinary.uploader.upload(file.path)
    // console.log(file_url);

    const upload_post = await postModel.create({
        file_url: file_url.secure_url,
        caption: data.caption,
        user_id: _id
    })

    if (upload_post) {
        const filePath = file.path
        // console.log(filePath);
        return {
            success: 1,
            status: app_constant.SUCCESS,
            message: "post added successfully",
            result: file_url,
        }

    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!', result: {}
    }

}

exports.updatePost = async (data, user_data) => {
    // console.log(data);
    const { post_id } = data
    const { file } = data
    const caption = data.caption ? data.caption : ""
    // console.log(_id);
    const post_data = await postModel.findOne({_id : post_id})
    if (!post_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'Post does not exist', result: {}
        }
    }
    // console.log(post_data);
    // console.log(user_data);
    
    
    // console.log(post_data.user_id, user_data._id);
    
    if (post_data.user_id.toString() != user_data._id.toString()) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'You cannnot update another post', result: {}
        }
    }
    const file_url = await cloudinary.uploader.upload(file.path)
    // console.log(file_url);

    const update_post = await postModel.updateOne(
        {_id : post_id}, 
        {$set : {file_url : file_url.secure_url, caption}})

    if (update_post) {
        // const filePath = file.path
        // console.log(filePath);
        return {
            success: 1,
            status: app_constant.SUCCESS,
            message: "post updated successfully",
            result: file_url,
        }

    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!', result: {}
    }

}

exports.getPostList = async (data) => {
    const { id } = data
    const _id = new mongoose.Types.ObjectId(id);
    // console.log(_id);

    const limit = data.limit >= 1 ? data.limit : 1000
    const offset = data.offset ? data.offset : 0
    const search = data.search ? data.search : ''
    // console.log(search);

    let search_query = {}

    const pipeline = [
        { $match: { user_id: _id } },
        { $match: search_query }
    ]

    // const total_count = user_data.followers.length

    if (search) {
        const regex = new RegExp(search, 'i')
        search_query["$or"] = [{ "caption": regex }]
    }

    const [result, total_count] = await Promise.all([
        postModel.aggregate([
            ...pipeline,
            { $sort: { createdAt: -1 } },
            { $unset: ["user_id", "__v"] },
            {
                $addFields: {
                    createdAt: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata"
                        }
                    },
                    updatedAt: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: "$updatedAt",
                            timezone: "Asia/Kolkata"
                        }
                    }
                }
            },
            { $skip: +offset },
            { $limit: Number(limit) },
        ]),
        postModel.aggregate([
            ...pipeline,
            { $count: "total_count" }
        ])
    ])
    // console.log(result);

    if (result) {
        return {
            success: 1,
            status: app_constant.SUCCESS,
            message: 'Posts list fetched successfully!',
            total_count: total_count.length ? total_count[0].total_count : 0,
            result
        };
    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!',
        result: {}
    }

}

exports.getOnePost = async (data) => {
     const {post_id} = data

     const post_data = await postModel.findById(post_id)

     if (post_data) {
        return {
            success: 1, 
            status: app_constant.SUCCESS, 
            message: 'Single Post data fetch Successfully', 
            result: post_data
        }
     }

     return {
        success: 0, 
        status: app_constant.INTERNAL_SERVER_ERROR, 
        message: 'Internal server error!', 
        result: {} 
     }
}


exports.likePost = async (data, user_data) => {
    const {_id} = user_data
    const {post_id} = data

    const post_data = await postModel.findOne({ _id: post_id })
    if (!post_data) {
        return { 
            success: 0, 
            status: app_constant.BAD_REQUEST, 
            message: 'Post does not exist!', 
            result: {} 
        }
    }

    const like_check = post_data.likes.includes(_id)
    if (like_check) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST, 
            message: 'Post is already liked!', 
            result: {} }
    }

    post_data.likes.push(_id)

    const update_post_data  = await postModel.updateOne(
        { _id: post_id },
        { $set: { likes: post_data.likes } })
           

    if (update_post_data) {
        return { 
            success: 1, 
            status: app_constant.SUCCESS, 
            message: 'Post liked successfully!', 
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

exports.unlikePost = async (data, user_data) => {
    const {_id} = user_data
    const {post_id} = data

    const post_data = await postModel.findOne({ _id: post_id })
    if (!post_data) {
        return { 
            success: 0, 
            status: app_constant.BAD_REQUEST, 
            message: 'Post does not exist!', 
            result: {} }
    }

    const like_check = post_data.likes.includes(_id)
    if (!like_check) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST, 
            message: 'Post is not liked!', 
            result: {} }
    }

    // post_data.likes.push(_id)
    const filter_existing_likes = post_data.likes.filter( (element)=> element.toString() !== _id.toString())
    // const filter_followers = user_data.followers.filter((element) => element.toString() !== auth_user_id.toString())

    const update_post_data  = await postModel.updateOne(
        { _id: post_id },
        { $set: { likes: filter_existing_likes } })
           

    if (update_post_data) {
        return { 
            success: 1, 
            status: app_constant.SUCCESS, 
            message: 'Post unliked successfully!', 
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

exports.getPostLikeList = async (data) => {
    const { post_id } = data
    const _id = new mongoose.Types.ObjectId(post_id);
    // console.log(_id);

    const limit = data.limit >= 1 ? data.limit : 1000
    const offset = data.offset ? data.offset : 0
    const search = data.search ? data.search : ''
    // console.log(search);
    const post_data = await postModel.findOne({_id : _id})

    if (!post_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'Post does not exists',
            result: {}
        }
    }

    let search_query = {}

    const pipeline = [
        { $match: { _id: _id } },
        {
            $lookup: {
                from: 'users',
                localField: "likes",
                foreignField: "_id",
                as: "likes_details"
            }
        },
        { $unwind: "$likes_details" },
        { $match: search_query },

    ]

    // const total_count = user_data.followers.length

    if (search) {
        const regex = new RegExp(search, 'i')
         search_query['$or'] = [
            { "likes_details.username": regex },
            { "likes_details.email": regex }
        ]
    }

    const [result, total_count] = await Promise.all([
        postModel.aggregate([
            ...pipeline,
            {
                $project: {
                    _id: 0,
                    username: "$likes_details.username",
                    email: "$likes_details.email",
                    user_id: "$likes_details._id"
                }
            },
            { $skip: +offset },
            { $limit: Number(limit) },
        ]),
        postModel.aggregate([
            ...pipeline,
            { $count: "total_count" }
        ])
    ])
    // console.log(result);

    if (result) {
        return {
            success: 1,
            status: app_constant.SUCCESS,
            message: 'Post Like list fetched successfully!',
            total_count: total_count.length ? total_count[0].total_count : 0,
            result
        };
    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!',
        result: {}
    }

}