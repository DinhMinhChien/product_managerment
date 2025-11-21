const express = require ('express');
const multer  = require('multer')
const upload = multer()
const uploadCloud = require("../../middlewares/admin/uploadCloud-middleware")
const route = express.Router();
const controller = require("../../controllers/admin/my-account-controller")

route.get('/',controller.index)
route.get('/edit',controller.edit)
route.patch(
    '/edit',
    upload.single("avatar"),
    uploadCloud.upload,
    controller.editPatch
)
module.exports = route;
