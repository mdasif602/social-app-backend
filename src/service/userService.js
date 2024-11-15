const userModel = require("../models/userModel");
const postModel = require("../models/postModel");
const bcrypt = require("bcrypt");
const app_constant = require("../constants/app.json");
const jwt = require("jsonwebtoken");
require("dotenv").config()
const cloudinary = require("../helpers/cloudinary")
const fs = require("fs")
const sendEmail = require("../helpers/sendEmail")

exports.userSignUp = async (data) => {
    //for Unique Email check
    const { email, password } = data;
    const user_data = await userModel.findOne({ email });
    if (user_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Email Already Exists",
            result: {},
        }
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(data.password, salt);

    const addUser = await userModel.create({ ...data, password: hashPassword });
    await sendEmail(email, data.username)
    return {
        success: 1,
        status: app_constant.SUCCESS,
        message: "user added successfully",
        result: addUser,
    };
};

exports.userLogin = async (data) => {
    const { email, password } = data;

    const user_data = await userModel.findOne({ email });
    console.log(user_data.email);

    if (!user_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Email does not exist!",
            result: {},
        };
    }

    const password_check = await bcrypt.compare(password, user_data.password);

    if (!password_check) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Invalid Credentials!",
            result: {},
        };
    }
    
    const token = jwt.sign({id : user_data._id}, process.env.JWT_SECRET_KEY)
    await userModel.updateOne({_id : user_data._id}, {$set:  {token}})
    // await sendEmail(email, user_data.username)
    return {
        success: 1,
        status: app_constant.SUCCESS,
        message: "user loggedin successfully",
        result: user_data,
        token : token
    };
};

exports.userProfile = async (data) => {
    const {id} = data
    
    // const user_data = await userModel.findById(id)
    // const user_data = await userModel.findOne({ _id: id }, { _id: 0, __v: 0, password: 0 })
    // const postCount = await postModel.countDocuments(id);

    const [user_data, postCount] = await Promise.all([
        userModel.findOne({ _id: id}, { _id: 0, __v: 0, password: 0 }),
        postModel.countDocuments({ user_id: id })
    ]);
    let result = {}
    const followers_count = user_data.followers.length
    const following_count = user_data.followings.length
    result = JSON.parse(JSON.stringify(user_data))
    // console.log(result);
    
    result.followers_count = followers_count
    result.following_count = following_count
    delete result.followers
    delete result.followings 

    
    result.postCount = postCount
    if (!user_data) {
        return {
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "User doesn't Exists",
            result: {},
        };
    }

    return {
        success: 1,
        status: app_constant.SUCCESS,
        message: "User found",
        result: result,
    };
}

// Follow Service*******************************************
exports.followUser = async (data, auth_user_data) => {
    const auth_user_id = auth_user_data._id
    const existing_followings = auth_user_data.followings
    const follow_user_id = data.id;

    if (auth_user_id == follow_user_id) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'Can not follow yourself!', 
            result: {} 
        }
    }

    const user_data = await userModel.findOne({ _id: follow_user_id })
    if (!user_data) {
        return { success: 0, status: app_constant.BAD_REQUEST, message: 'User does not exist!', result: {} }
    }

    const follow_check = existing_followings.includes(follow_user_id)
    if (follow_check) {
        return { success: 0, status: app_constant.BAD_REQUEST, message: 'User is already followed!', result: {} }
    }

    existing_followings.push(follow_user_id)
    user_data.followers.push(auth_user_id)

    const [update_follow_user, update_auth_user] = await Promise.all([
        userModel.updateOne(
            { _id: follow_user_id },
            { $set: { followers: user_data.followers } }
        ),
        userModel.updateOne(
            { _id: auth_user_id },
            { $set: { followings: existing_followings } }
        )
    ])

    if (update_follow_user && update_auth_user) {
        return { success: 1, status: app_constant.SUCCESS, message: 'User followed successfully!', result: {} };
    }

    return { success: 0, status: app_constant.INTERNAL_SERVER_ERROR, message: 'Internal server error!', result: {} }
}

// Unfollow Service*********************************************
exports.unFollowUser = async (data, auth_user_data) => {
    const auth_user_id = auth_user_data._id
    const existing_followings = auth_user_data.followings
    const unFollow_user_id = data.id;
    // console.log(unFollow_user_id);
    // console.log(auth_user_id);
    
    if (auth_user_id == unFollow_user_id) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'Can not unFollow yourself!', 
            result: {} 
        }
    }

    const user_data = await userModel.findOne({ _id: unFollow_user_id })
    if (!user_data) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'User does not exist!',
            result: {} }
    }

    const unFollow_check = existing_followings.includes(unFollow_user_id)

    if (!unFollow_check) {
        return { 
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: 'User is not followed',
            result: {} }
    }

    // existing_followings.push(follow_user_id)
    // user_data.followers.push(auth_user_id)
    const filter_exixting_followings = existing_followings.filter( (element)=> element.toString() !== unFollow_user_id)
    const filter_followers = user_data.followers.filter((element) => element.toString() !== auth_user_id.toString())
    // console.log(filter_exixting_followings);
    // console.log(filter_followers);
    
    
    
    const [update_unFollow_user, update_auth_user] = await Promise.all([
        userModel.updateOne(
            { _id: unFollow_user_id },
            { $set: { followers: filter_followers } }
        ),
        userModel.updateOne(
            { _id: auth_user_id },
            { $set: { followings: filter_exixting_followings } }
        )
    ])

    if (update_unFollow_user && update_auth_user) {
        return { 
            success: 1,
            status: app_constant.SUCCESS,
            message: 'User unfollowed successfully!',
            result: {} };
    }

    return { 
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!',
        result: {} }
}


exports.getFollowersList = async (user_data, data) => {
    const {_id} = user_data
    // console.log(user_data);
    console.log(_id);
    
    const limit = data.limit >= 1 ? data.limit : 1000
    const offset = data.offset ? data.offset : 0
    const search = data.search ? data.search : ''
    let search_query = {}

    const pipeline = [
        { $match: { _id: _id } },
        {
            $lookup: {
                from: 'users',
                localField: "followers",
                foreignField: "_id",
                as: "followers_details"
            }
        },
        { $unwind: "$followers_details" },
        { $match: search_query }
    ]

    // const total_count = user_data.followers.length
    
    if (search) {
        const regex = new RegExp(search, 'i')
        // console.log(regex)
        // search_query = {"followers_details.username" : regex}
        search_query = {
            $or : [
                {"followers_details.username" : regex},
                {"followers_details.email" : regex}
            ]
        }
        
    }
    const [result, total_count] = await Promise.all([
    userModel.aggregate([
            ...pipeline,
            {
                $project: {
                    _id: 0,
                    email: "$followers_details.email",
                    username: "$followers_details.username"
                }
            },
            { $skip: +offset },
            { $limit: Number(limit) },
        ]),
        userModel.aggregate([
            ...pipeline,
            { $count: "total_count" }
        ])
    ])

    if (result) {
        return { 
            success: 1,
            status: app_constant.SUCCESS,
            message: 'Followers list fetched successfully!',
            total_count: total_count.length ? total_count[0].total_count : 0,
            result 
        };
    }

    return { success: 0, status: app_constant.INTERNAL_SERVER_ERROR, message: 'Internal server error!', result: {} }
    
}


exports.getFollowingsList = async (user_data, data) => {
    const {_id} = user_data
    // console.log(user_data);
    // console.log(data);
    const {followings} = user_data
    const limit = data.limit ? data.limit : 1000
    const offset = data.offset ? data.offset : 0
    const search = data.search ? data.search : ''
    const query = {_id: {$in : followings}}

    // const total_count = user_data.followers.length
    
    if (search) {
        const regex = new RegExp(search, 'i')
        // console.log(regex)
        // query.username = regex
        query['$or'] = [
            {"username" : regex},
            {"email" : regex}
        ]
    }


    // const result = await userModel.aggregate([
    //     { $match: { _id: _id } },
    //     {
    //         $lookup: {
    //             from: 'users',
    //             localField: "followings",
    //             foreignField: "_id",
    //             as: "followers_details"
    //         }
    //     },
    //     { $unwind: "$followers_details" },
    //     {
    //         $limit: Number(limit)
    //     },
    //     {
    //         $skip: +offset
    //     },
    //     {
    //         $project: {
    //             _id: 0,
    //             // followers_details: 1
    //             email: "$followers_details.email",
    //             username: "$followers_details.username"

    //         }
    //     },

    // ])

    // const result = await userModel.find(_id).select({_id : 0, followings : 1}).populate("followings")

    // const result = await userModel.find(query).select({username : 1, email : 1, _id : 0}).skip(offset).limit(limit)
    // console.log("Hello", result);
    const [result, total_count] = await Promise.all([
        userModel.find(query).select({username : 1, email : 1, _id : 0}).skip(offset).limit(limit),
        userModel.countDocuments(query)
    ])

    if (result ) {
        return {
            success: 1,
            status: app_constant.SUCCESS,
            message: 'Followings list fetched successfully',
            result: result,
            total_count
        }
    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!', result: {} 
    }
}

// Service for updating profile photo using Cloudinary
exports.updateProfilePic = async (data, user_data) => {
       // console.log(data);
    const { _id } = user_data
    const { file } = data
    // console.log(_id);
    const file_url = await cloudinary.uploader.upload(file.path)
    // console.log(file_url);

    const upload_profilePic = await userModel.updateOne({ _id: _id }, {
        $set: { profile_pic: file_url.secure_url }
      })

    if (upload_profilePic) {
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
            message: "Profile Added/Updated added successfully",
            result: file_url,
        }

    }

    return {
        success: 0,
        status: app_constant.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!', result: {}
    }
}