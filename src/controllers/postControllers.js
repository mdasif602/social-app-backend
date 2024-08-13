const app_constant = require("../constants/app.json");
const postService = require("../service/postService");
const validationHelper = require("../helpers/validation");
const fs = require("fs")

exports.uploadPost = async (request, response) => {
    try {
        // console.log(request.file);
        if (!request.file) {
            response.json({
                success: 0,
                status_code: app_constant.INTERNAL_SERVER_ERROR,
                message: "Please upload the file",
                result: {},
              });
        }
        request.body.file = request.file
        const upload_post = await postService.postUpload(request.body, request.user);
        fs.unlink(request.file.path, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            }
            // console.log('File deleted successfully!');
        })
        return response.json(upload_post);
        
      } catch (error) {
        console.log(error);
        response.json({
          success: 0,
          status_code: app_constant.INTERNAL_SERVER_ERROR,
          message: error.message,
          result: {},
        });
      }
}

exports.updatePost = async (request, response) => {
  try {
      // console.log(request.file);
      const required_fields = ["post_id"];
      const validation = validationHelper.validation(
        required_fields,
        request.body
      );
  
      if (Object.keys(validation).length) {
        return response.json({
          success: 0,
          status_code: app_constant.BAD_REQUEST,
          message: validation,
          result: {},
        });
      }
      if (!request.file) {
          response.json({
              success: 0,
              status_code: app_constant.INTERNAL_SERVER_ERROR,
              message: "Please upload the file",
              result: {},
            });
      }
      request.body.file = request.file
      const update_Post = await postService.updatePost(request.body, request.user);
      fs.unlink(request.file.path, (err) => {
          if (err) {
              console.error('Error deleting the file:', err);
          }
          // console.log('File deleted successfully!');
       })
      return response.json(update_Post);
      
    } catch (error) {
      console.log(error);
      response.json({
        success: 0,
        status_code: app_constant.INTERNAL_SERVER_ERROR,
        message: error.message,
        result: {},
      });
    }
}



exports.getPostList = async (request, response) => {
    try {
        const get_posts = await postService.getPostList(request.query)
        return response.json(get_posts)
    } catch (error) {
        console.log(error)
    }
}

exports.getOnePost = async (request, response) => {
    try {
      const required_fields = ["post_id"];
      const validation = validationHelper.validation(
        required_fields,
        request.body
      );
  
      if (Object.keys(validation).length) {
        return response.json({
          success: 0,
          status_code: app_constant.BAD_REQUEST,
          message: validation,
          result: {},
        });
      }
      const get_post = await postService.getOnePost(request.body)
      return response.json(get_post)
    } catch (error) {
      console.log(error);
      response.json({
        success: 0,
        status_code: app_constant.INTERNAL_SERVER_ERROR,
        message: error.message,
        result: {},
      });
    }
}

exports.likePost = async (request, response) => {
  try {
      // console.log(request.file);
      const required_fields = ["post_id"];
      const validation = validationHelper.validation(
        required_fields,
        request.body
      );
  
      if (Object.keys(validation).length) {
        return response.json({
          success: 0,
          status_code: app_constant.BAD_REQUEST,
          message: validation,
          result: {},
        });
      }
      const like_post = await postService.likePost(request.body, request.user);
      return response.json(like_post);
    } catch (error) {
      console.log(error);
      response.json({
        success: 0,
        status_code: app_constant.INTERNAL_SERVER_ERROR,
        message: error.message,
        result: {},
      });
    }
}

exports.unlikePost = async (request, response) => {
  try {
      // console.log(request.file);
      const required_fields = ["post_id"];
      const validation = validationHelper.validation(
        required_fields,
        request.body
      );
  
      if (Object.keys(validation).length) {
        return response.json({
          success: 0,
          status_code: app_constant.BAD_REQUEST,
          message: validation,
          result: {},
        });
      }
      const unlike_post = await postService.unlikePost(request.body, request.user);
      return response.json(unlike_post);
    } catch (error) {
      console.log(error);
      response.json({
        success: 0,
        status_code: app_constant.INTERNAL_SERVER_ERROR,
        message: error.message,
        result: {},
      });
    }
}
// getPostLikeList

exports.getPostLikeList = async (request, response) => {
  try {
      const required_fields = ["post_id"];
      const validation = validationHelper.validation(
        required_fields,
        request.query
      );

      if (Object.keys(validation).length) {
        return response.json({
          success: 0,
          status_code: app_constant.BAD_REQUEST,
          message: validation,
          result: {},
        });
      }
      const get_posts = await postService.getPostLikeList(request.query)
      return response.json(get_posts)
  } catch (error) {
      console.log(error)
  }
}