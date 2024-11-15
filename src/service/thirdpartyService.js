const axios = require('axios')
require("dotenv").config()
exports.getCurrency = async (data) => {
    const {source , currencies} = data
    const currency_res = await axios.get(`http://apilayer.net/api/live?access_key=${process.env.CURRENCY_API_KEY}&source=${source}&currencies=${currencies}`)
    return currency_res.data
}


// http://apilayer.net/api/live

//     ? access_key = 2d36aee15a423bcbd81c7814a1de2f53
//     & currencies = EUR,GBP,CAD,PLN
//     & source = USD
//     & format = 1