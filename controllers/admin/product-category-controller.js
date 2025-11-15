const ProductCategory = require("../../models/product_category_model");
const systemConfig = require("../../config/system")
const filterStatusHelper = require("../../helpers/filterStatus")
const searchHelper = require("../../helpers/search")
const paginationHelper = require("../../helpers/pagination")
const createTreeHelper = require("../../helpers/createTree")
module.exports.index = async(req,res) => {
    const filterStatus = filterStatusHelper(req.query);
    let find = {
        deleted: false
    }
    let objectSearch = searchHelper(req.query)
    if(objectSearch.regex){
        find.title = objectSearch.regex
    }
    if(req.query.status){
        find.status = req.query.status;
    }
    //pagination
    const countProducts = await ProductCategory.countDocuments(find)
    let objectPagination = paginationHelper(
            {
                currentPage: 1,
                limitItem: 6
            },
            req.query,
            countProducts
        );
    //end pagination
    
    //sort
    let sort={};
    if(req.query.sortKey && req.query.sortValue){
        sort[req.query.sortKey]=req.query.sortValue
    }else{
        sort.position="desc"
    }
    //end sort


    const record =  await ProductCategory
    .find(find)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip)
    .sort(sort)
    const newrecords = createTreeHelper.tree(record);
    res.render("admin/pages/product-category/index",{
        pageTitle: "Danh mục sản phẩm",
        record: newrecords,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

module.exports.create = async(req,res) => {

    let find = {
        deleted: false
    };

    const records = await ProductCategory.find(find).sort()

    const newrecords = createTreeHelper.tree(records);

    res.render("admin/pages/product-category/create",{
        pageTitle: "Tạo danh mục sản phẩm",
        records: newrecords
    });
}

module.exports.createPost = async (req,res) => {
    if(req.body.position == ""){
        const count = await ProductCategory.countDocuments()
        req.body.position = count + 1
    }else{
        req.body.position = parseInt(req.body.position)
    }
    const record = new ProductCategory(req.body);
    await record.save();
    res.redirect(`${systemConfig.prefixAdmin}/products-category`)
}

module.exports.changeStatus = async (req,res) => {
    const status = req.params.status
    const id = req.params.id

    await ProductCategory.updateOne({ _id: id},{ status: status})

    req.flash("success","Cập nhật thành công")

    res.redirect(req.get('Referrer'));
}

module.exports.changeMulti = async (req,res) => {
    const type = req.body.type
    const ids = req.body.ids.split(", ")
    switch (type) {
        case "active":
            await ProductCategory.updateMany({_id: { $in:ids} },{status: "active"});
            req.flash("success",`Cập nhật trạng thái thành công ${ids.length} sản phẩm!`)
            break;
    
        case "inactive":
            await ProductCategory.updateMany({_id: { $in:ids} },{status: "inactive"});
            req.flash("success",`Cập nhật trạng thái thành công ${ids.length} sản phẩm!`)
            break;
        case  "delete-all":
            await ProductCategory.updateMany({_id: { $in:ids} },{
                deleted: true,
                deletedAt: new Date()
            });
            req.flash("success",`Xoá thành công ${ids.length} sản phẩm!`)
            break;
        case "change-position":
            for (const item of ids) {
                let [id,position] = item.split("-");
                position = parseInt(position);
                await ProductCategory.updateOne({_id: id},{position: position});
                req.flash("success",`Đổi vị trí thành công ${ids.length} sản phẩm!`)
            }
            break;
        default:
            break;
    }
    res.redirect(req.get('Referrer'));
}

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
    const countProducts = await ProductCategory.countDocuments(find)

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req.query,
        countProducts
    );
    // end pagination
    const record =  await ProductCategory.find(find).limit(objectPagination.limitItem).skip(objectPagination.skip);
    res.render("admin/pages/product-category/restore",{
        pageTitle: "Trang sản phẩm bị xoá",
        record: record,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

module.exports.restoreItem = async (req,res) => {
    const id = req.params.id
    try {
        await ProductCategory.updateOne(
            { _id: id },
            { 
                deleted: false,
                deletedAt: null 
            }
        );
    } catch (error) {
        console.log("lỗi") 
    }
    res.redirect(req.get('Referrer')); 
}

module.exports.deleteItem = async (req,res) => {
    const id = req.params.id
    await ProductCategory.updateOne({ _id: id},{
            deleted: true,
            deletedAt: new Date()
        }
    )
    req.flash("success",`Xoá thành công sản phẩm!`)
    res.redirect(req.get('Referrer'));
}
module.exports.detail = async (req,res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
        const record = await ProductCategory.findOne(find)
        res.render("admin/pages/product-category/detail.pug",{
            pageTitle: record.title,
            record: record
        })
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`)
    }
}

module.exports.edit = async (req,res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        }
        const data = await ProductCategory.findOne(find)

        const records = await ProductCategory.find({deleted: false})
        const newrecords = createTreeHelper.tree(records);

        res.render("admin/pages/product-category/edit.pug",{
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newrecords
        })
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`)
    }
}

module.exports.editPatch = async (req,res) => {
    req.body.position = parseInt(req.body.position)
    try {
        await ProductCategory.updateOne({_id: req.params.id},req.body)
        req.flash("success","Cập nhật thành công!")
    } catch (error) {
        req.flash("error","Cập nhật thất bại!")
    }
    res.redirect(req.get('Referrer'))
}