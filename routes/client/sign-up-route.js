const express = require ('express');
const route = express.Router();

const controller = require("../../controllers/client/sign-up-controller")

route.get('/',controller.index)
route.post('/',controller.signupPost)
module.exports = route;
