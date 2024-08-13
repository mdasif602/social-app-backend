const app_constant = require("../constants/app.json");
const commentService = require("../service/commentService");
const validationHelper = require("../helpers/validation");
const fs = require("fs");
const { request } = require("express");


exports.addComment = async (request, response) => {
    try {
        const required_fields = ["post_id", "comment"];
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

        const add_comment = await commentService.addComment(request.body, request.user)
        return response.json(add_comment)
    } catch (error) {
       console.log(error);
    }
}