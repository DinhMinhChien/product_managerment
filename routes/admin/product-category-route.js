const express = require ('express');
const multer  = require('multer');

const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud-middleware")
const route = express.Router();

const validate = require("../../validates/admin/product-category-validate")
const controller = require("../../controllers/admin/product-category-controller")

route.get('/',controller.index)

//tạo mới 1 sản phẩm
route.get('/create',controller.create)
route.post(
    "/create",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost, 
    controller.createPost
)
//end

//thay đổi trạng thái 1 sản phẩm
route.patch('/change-status/:status/:id',controller.changeStatus)
//end

//thay đổi trạng thái nhiều sản phẩm
route.patch('/change-multi',controller.changeMulti)
//end

//thùng rác
route.get("/trash", controller.trash);
route.patch("/restore/:id",controller.restoreItem)

//xoá 1 sản phẩm 
route.delete('/delete/:id',controller.deleteItem)

//chi tiết sản phẩm 
route.get("/detail/:id",controller.detail)

//chỉnh sửa sản phẩm 
route.get("/edit/:id",controller.edit)
route.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.editPatch
)





module.exports = route;