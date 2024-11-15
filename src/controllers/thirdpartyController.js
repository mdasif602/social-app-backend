const { request, response } = require("express");
const thirdpartyService = require("../service/thirdpartyService");
const validationHelper = require("../helpers/validation")
exports.getCurrency = async (request, response) => {
    const required_fields = ["source", "currencies"];
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

    const data = await thirdpartyService.getCurrency(request.query)

    return response.json(data)
}