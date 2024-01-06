var express = require('express');
const { model } = require('mongoose');
const { use } = require('.');
var router = express.Router();
var responseData = require('../helper/responseData');
var modelUser = require('../models/user')
var validate = require('../validates/user')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const configs = require('../helper/configs')
const { checkLogin,checkAuthor } = require("../middleware/protect")


router.get('/', async function (req, res, next) {
  console.log(req.query);
  var usersAll = await modelUser.getall(req.query);
  responseData.responseReturn(res, 200, true, usersAll);
});

router.get('/:id', async function (req, res, next) {// get by ID
  try {
    var user = await modelUser.getOne(req.params.id);
    responseData.responseReturn(res, 200, true, user);
  } catch (error) {
    responseData.responseReturn(res, 404, false, "khong tim thay user");
  }
});
router.delete('/delete/:id', function (req, res, next) {//delete by Id
  try {
    var user = modelUser.findByIdAndDelete(req.params.id);
    responseData.responseReturn(res, 200, true, "xoa thanh cong");
  } catch (error) {
    responseData.responseReturn(res, 404, false, "khong tim thay user");
  }
});


router.post('/register', validate.validator(),
  async function (req, res, next) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      responseData.responseReturn(res, 400, false, errors.array().map(error => error.msg));
      return;
    }
    var user = await modelUser.getByName(req.body.userName);
    if (user) {
      responseData.responseReturn(res, 404, false, "user da ton tai");
    } else {
      const newUser = await modelUser.createUser({
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
      })
      var token = newUser.getJWT()
      res.cookie('tokenJWT',token);
      responseData.responseReturn(res, 200, true, token);
    }
  });
router.post('/login', async function (req, res, next) {
  var result = await modelUser.login(req.body.userName, req.body.password);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
  }
  console.log(result);
  var token = result.getJWT();
  res.cookie('tokenJWT',token);
  responseData.responseReturn(res, 200, true, token);
});

router.get('/me', async function(req, res, next){
  var result = await checkLogin(req);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  req.userID = result;
  next();
},async function(req, res, next){
  // var user = await modelUser.getOne(req.userID);
  var userAuthor = await modelUser.checkAuthor(req)
  if(userAuthor.err){
    responseData.responseReturn(res, 400, true, userAuthor.err);
    return;
  }
  next()
  
}, async function (req, res, next) {//get all
  var user = await modelUser.getOne(req.userID);
  res.send({ "done": user});
});

module.exports = router;
