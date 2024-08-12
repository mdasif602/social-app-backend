const app_constant = require("../constants/app.json");
const userService = require("../service/userService");
const validationHelper = require("../helpers/validation");
const { request, response } = require("express");

exports.userSignup = async (request, response) => {
  try {
    // checking all the filled are given by the user or not
    const required_fields = ["username", "email", "password"];
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
    const validEmail = validationHelper.validEmail(request.body.email)
    // console.log(validEmail)
    if (!validEmail) {
        return response.json({
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Enter a valid Email",
            result: {},
        })
    }
    // if all the filleds are filled then..
    const addUser = await userService.userSignUp(request.body);

    return response.json(addUser);
  } catch (error) {
    console.log(error);
    response.json({
      success: 0,
      status_code: app_constant.INTERNAL_SERVER_ERROR,
      message: error.message,
      result: {},
    });
  }
};

exports.userLogin = async (request, response) => {
  try {
    // checking all the filled are given by the user or not
    const required_fields = ["email", "password"];
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
    const validEmail = validationHelper.validEmail(request.body.email)
    // console.log(validEmail)
    if (!validEmail) {
        return response.json({
            success: 0,
            status: app_constant.BAD_REQUEST,
            message: "Enter a valid Email",
            result: {},
        })
    }
    // if all the filleds are filled then..
    const addUser = await userService.userLogin(request.body);

    return response.json(addUser);
  } catch (error) {
    console.log(error);
    response.json({
      success: 0,
      status_code: app_constant.INTERNAL_SERVER_ERROR,
      message: error.message,
      result: {},
    });
  }
};


exports.userProfile = async (request, response) => {
    try {
        //  console.log(request.user)
         
         const required_fields = ['id']
         const validation = validationHelper.validation(required_fields, request.params)

         if (Object.keys(validation).length) {
            return response.json({
              success: 0,
              status_code: app_constant.BAD_REQUEST,
              message: validation,
              result: {},
            });
          }

          const getUser = await userService.userProfile(request.params)
      
          return response.json(getUser);
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


exports.followUser = async (request, response) => {
    try {
      // checking all the filled are given by the user or not
      const required_fields = ["id"];
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
      // if all the filleds are filled then..
      const follow = await userService.followUser(request.body, request.user);
  
      return response.json(follow);
    } catch (error) {
      console.log(error);
      response.json({
        success: 0,
        status_code: app_constant.INTERNAL_SERVER_ERROR,
        message: error.message,
        result: {},
      });
    }
  };

exports.unFollowUser = async (request, response) => {
    try {
      // checking all the filled are given by the user or not
      const required_fields = ["id"];
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
      // if all the filleds are filled then..
      const unfollow = await userService.unFollowUser(request.body, request.user);
  
      return response.json(unfollow);
    } catch (error) {
      console.log(error);
      response.json({
        success: 0,
        status_code: app_constant.INTERNAL_SERVER_ERROR,
        message: error.message,
        result: {},
      });
    }
  };

exports.getFollowersList = async (request, response) => {
        try {
            const get_users = await userService.getFollowersList(request.user, request.query)
            return response.json(get_users)
        } catch (error) {
            console.log(error)
        }
}

exports.getFollowingsList = async (request, response) => {
        try {
            const get_users = await userService.getFollowingsList(request.user, request.query)
            return response.json(get_users)
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

exports.updateProfilePic = async (request, response) => {
  try {
    if (!request.file) {
        response.json({
            success: 0,
            status_code: app_constant.INTERNAL_SERVER_ERROR,
            message: "Please upload the file",
            result: {},
          });
    }
    request.body.file = request.file
    const upload_profilePic = await userService.updateProfilePic(request.body, request.user)
    return response.json(upload_profilePic)
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


// const userService = require("../service/userService")

// exports.userSignup = async (req, res) => {
//     try {
//         const data = req.body
//         const { username, email, password } = data
//         if (!username || !email || !password) {
//             return res.json({
//                 success: false,
//                 status: 401,
//                 message: "Insufficient detail"
//             })
//         }
//         const result = await userService.userSignUp(data)

//         return res.json(result);

//     } catch (error) {
//         console.log(error);

//     }
// }

// exports.userLogIn = async (req, res) => {
//     try {
//          const required_fields = ['email', 'password']

//          const validation 
//     } catch (error) {
//         console.log(error);
        
//     }
// }