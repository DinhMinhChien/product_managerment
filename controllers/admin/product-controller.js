const Product = require("../../models/product_model");
const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
const paginationHelper = require("../../helpers/pagination")
const createTreeHelper = require("../../helpers/createTree")
const ProductCategory = require("../../models/product_category_model");
const systemConfig = require("../../config/system")
const Account = require("../../models/account_model");
// [GET] /admin/products
module.exports.product = async(req,res) => {
    const filterStatus = filterStatusHelper(req.query);

    let find = {
        deleted: false
    }
    if(req.query.status){
        find.status = req.query.status;
    }

    let objectSearch = searchHelper(req.query)
    if(objectSearch.regex){
        find.title = objectSearch.regex
    }

    // pagination
    const countProducts = await Product.countDocuments(find)

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req.query,
        countProducts
    );
    // end pagination

    //sort
    let sort={};
    if(req.query.sortKey && req.query.sortValue){
        sort[req.query.sortKey]=req.query.sortValue
    }else{
        sort.position="desc"
    }
    
    //end sort

    const products =  await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

    for (const product of products) {
        // thông tin người tạo
        const user = await Account.findOne({_id: product.createdBy.account_id})
        if(user){
            product.accountFullName = user.fullName
        }

        // thông tin người cập nhật gần nhất 
        const updatedBy = product.updatedBy.slice(-1)[0]
        if(updatedBy){
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            })
            updatedBy.accountFullName = userUpdated.fullName
        }
    }

    res.render("admin/pages/product/index",{
        pageTitle: "Trang sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

//[PATCH] /admin/product/change-status/:status/:id
module.exports.changeStatus = async (req,res) => {
    const status = req.params.status
    const id = req.params.id

    await Product.updateOne({ _id: id},{ status: status})

    req.flash("success","Cập nhật thành công")

    res.redirect(req.get('Referrer'));
}
//[PATCH] /admin/product/change-multi
module.exports.changeMulti = async (req,res) => {
    const type = req.body.type
    const ids = req.body.ids.split(", ")
    const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        }

    switch (type) {
        case "active":
            await Product.updateMany({_id: { $in:ids} },{
                status: "active",
                $push: {updatedBy: updatedBy}
            });
            req.flash("success",`Cập nhật trạng thái thành công ${ids.length} sản phẩm!`)
            break;
    
        case "inactive":
            await Product.updateMany({_id: { $in:ids} },{
                status: "inactive",
                $push: {updatedBy: updatedBy}
            });
            req.flash("success",`Cập nhật trạng thái thành công ${ids.length} sản phẩm!`)
            break;
        case  "delete-all":
            await Product.updateMany({_id: { $in:ids} },{
                deleted: true,
                deletedBy: {
                    account_id: res.locals.user.id,
                    deletedAt: new Date()
                }
            });
            req.flash("success",`Xoá thành công ${ids.length} sản phẩm!`)
            break;
        case "change-position":
            for (const item of ids) {
                let [id,position] = item.split("-");
                position = parseInt(position);
                await Product.updateOne({_id: id},{
                    position: position,
                    $push: {updatedBy: updatedBy}
                });
                req.flash("success",`Đổi vị trí thành công ${ids.length} sản phẩm!`)
            }
            break;
        default:
            break;
    }
    res.redirect(req.get('Referrer'));
}

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req,res) => {
    const id = req.params.id

    await Product.updateOne({ _id: id},{
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date()
            }
        }
    )
    req.flash("success",`Xoá thành công sản phẩm!`)
    res.redirect(req.get('Referrer'));
}

//[PATH] /admin/products/trash
module.exports.trash = async(req,res) => {
    const filterStatus = filterStatusHelper(req.query);
    let find = {
        deleted: true
    }
    if(req.query.status){
        find.status = req.query.status;
    }
    let objectSearch = searchHelper(req.query)

    if(objectSearch.regex){
        find.title = objectSearch.regex
    }

    // pagination
    const countProducts = await Product.countDocuments(find)

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req.query,
        countProducts
    );
    // end pagination
    const products =  await Product.find(find).limit(objectPagination.limitItem).skip(objectPagination.skip);
    for (const product of products) {
        const user = await Account.findOne({_id: product.deletedBy.account_id})
        if(user){
            product.accountFullNameDelete = user.fullName
        }
    }
    res.render("admin/pages/product/restore",{
        pageTitle: "Trang sản phẩm bị xoá",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}
module.exports.restoreItem = async (req,res) => {
    const id = req.params.id
    try {
        await Product.updateOne(
            { _id: id },
            { 
                deleted: false,
                deletedBy: {
                    account_id: null,
                    deletedAt: null
                } 
            }
        );
    } catch (error) {
        console.log("lỗi") 
    }
    res.redirect(req.get('Referrer')); 
}

//[GET]/admin/products/create
module.exports.create = async (req,res) => {

    let find = {
        deleted: false
    };

    const category = await ProductCategory.find(find)

    const newcategory = createTreeHelper.tree(category);
    res.render("admin/pages/product/create",{
        pageTitle: "Thêm mới sản phẩm",
        category: newcategory

    })
}
module.exports.createPost = async (req,res) => {

    req.body.price = parseFloat(req.body.price)
    req.body.discountPercentage = parseFloat(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    if(req.body.position == ""){
        const countProducts = await Product.countDocuments()
        req.body.position = countProducts + 1
    }else{
        req.body.position = parseInt(req.body.position)
    }
    req.body.createdBy = {
        account_id: res.locals.user.id
    }
    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`)
}
//[GET]/admin/products/edit
module.exports.edit = async (req,res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
        const product = await Product.findOne(find)
        
        const category = await ProductCategory.find({
            deleted: false
        })
        const newcategory = createTreeHelper.tree(category);
        res.render("admin/pages/product/edit.pug",{
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product,
            category: newcategory
        })
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
}
//[PATCH]/admin/products/edit
module.exports.editPatch = async (req,res) => {
    req.body.price = parseFloat(req.body.price)
    req.body.discountPercentage = parseFloat(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    req.body.position = parseInt(req.body.position)
    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        }
        await Product.updateOne({_id: req.params.id},{
            ...req.body,
            $push: {updatedBy: updatedBy}
        })
        req.flash("success","Cập nhật thành công!")
    } catch (error) {
        req.flash("error","Cập nhật thất bại!")
    }
    res.redirect(req.get('Referrer'))
}
module.exports.detail = async (req,res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
        const product = await Product.findOne(find)
        res.render("admin/pages/product/detail.pug",{
            pageTitle: product.title,
            product: product
        })
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`)
    }
}
