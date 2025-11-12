const express = require ('express');
const multer  = require('multer')

const upload = multer()
const uploadCloud = require("../../middlewares/admin/uploadCloud-middleware")
const route = express.Router();
const controller = require("../../controllers/admin/product-controller")
const validate = require("../../validates/admin/product-validate")
route.get('/',controller.product)

route.patch('/change-status/:status/:id',controller.changeStatus)
route.patch("/change-multi",controller.changeMulti)
route.delete('/delete/:id',controller.deleteItem)

route.get("/trash", controller.trash);
route.patch("/restore/:id",controller.restoreItem)

route.get("/create",controller.create)

route.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost, 
    controller.createPost)

route.get("/edit/:id",controller.edit)
route.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.editPatch
)

route.get("/detail/:id",controller.detail)

module.exports = route;