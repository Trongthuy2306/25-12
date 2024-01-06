var jwt = require('jsonwebtoken');
const configs = require('../helper/configs');
var modelUser = require('../models/user')
module.exports = {
    checkLogin:
        async function (req) {
            var result = {}
            var token = req.headers.authorization;
            if (!token) {
                return result.err = "Vui long dang nhap";
            }
            if (token.startsWith("Bearer")) {
                token = token.split(" ")[1];
                try {
                    var userID = await jwt.verify(token, configs.SECRET_KEY);
                    return userID.id;
                } catch (error) {
                    return result.err = "Vui long dang nhap";
                }
            } else {
                return result.err = "Vui long dang nhap";
            }
        },
    checkAuthor :  
    async function (req){
        var user = await modelUser.getOne(req.userID);
        var role = user.role;
        var DSRole = ['admin','publisher'];
        if(DSRole.includes(role)){
            next();
          }
          else{
            responseData.responseReturn(res, 403, true,"ban khong du quyen");
          }
    }
   
}