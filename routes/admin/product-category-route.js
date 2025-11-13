const express = require ('express');
const multer  = require('multer');

const upload = multer();

const validate = require("../../validates/admin/product-category-validate")

const uploadCloud = require("../../middlewares/admin/uploadCloud-middleware")

const route = express.Router();
const controller = require("../../controllers/admin/product-category-controller")

route.get('/',controller.index)
route.get('/create',controller.create)
route.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost, 
    controller.createPost
)

module.exports = route;