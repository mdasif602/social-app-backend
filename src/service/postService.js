const { mongoose } = require("mongoose");
const app_constant = require("../constants/app.json");
require("dotenv").config()
const cloudinary = require("../helpers/cloudinary")
const postModel = require("../models/postModel")
const fs = require("fs")

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

        fs.unlink(file.path, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            }
            // console.log('File deleted successfully!');
        })
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