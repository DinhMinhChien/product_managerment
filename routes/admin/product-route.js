const express = require ('express');
const multer  = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
// const storageMulter = require("../../helpers/storageMulter")


cloudinary.config({ 
        cloud_name: 'daksmfztr', 
        api_key: '637692585737827', 
        api_secret: 'PFtQ7yFujF2Tib-dj1snXGrhnIo' 
});

const upload = multer()

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
    function (req, res, next) {
        if(req.file){
            let streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream(
                        (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                        }
                    );

                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };
            async function upload(req) {
                let result = await streamUpload(req);
                req.body[req.file.fieldname] = result.secure_url;
                next();
            }
            upload(req);
        }else{
            next();
        }
    },
    validate.createPost, 
    controller.createPost)

route.get("/edit/:id",controller.edit)
route.patch("/edit/:id",upload.single("thumbnail"),validate.createPost,controller.editPatch)

route.get("/detail/:id",controller.detail)

module.exports = route;