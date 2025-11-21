const md5 = require('md5');
const Account = require("../../models/account_model")
const systemConfig = require("../../config/system")
const Role = require("../../models/role_model")

// [GET] /admin/accounts
module.exports.index = async (req,res) => {
    let find = {
        deleted: false
    }
    const records = await Account.find(find).select("-password -token")
    
    for (const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false
        })
        record.role = role
    }
    
    res.render("admin/pages/accounts/index",{
        pageTitle: "Danh sách tài khoản",
        records: records
    });
}
module.exports.create = async (req,res) => {
    const roles = await Role.find({deleted: false})
    res.render("admin/pages/accounts/create",{
        pageTitle: "Tạo mới tài khoản",
        roles: roles
    });
}
module.exports.createPost = async (req,res) => {
    const emailExist = await Account.findOne({
        email: req.body.email,
        deleted: false
    })
    if(emailExist){
        req.flash("error","Email đã tồn tại. Vui lòng nhập lại")
        res.redirect(req.get('Referrer'))
    }else{
        req.body.password = md5(req.body.password);
        const record = new Account(req.body)
        await record.save();
        res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
    
}
module.exports.edit= async (req,res) => {
    let find = {
        _id: req.params.id,
        deleted: false
    }
    try{
        const data = await Account.findOne(find)

        const roles = await Role.find({deleted: false})
        res.render("admin/pages/accounts/edit",{
            pageTitle: "Chỉnh sửa tài khoản",
            data: data,
            roles: roles
        })
    }catch(error){
        res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
}
module.exports.editPatch = async (req,res) => {
    const id = req.params.id
    const emailExist = await Account.findOne({
        _id: {$ne: id},
        email: req.body.email,
        deleted: false
    })
    if(emailExist){
        req.flash("error","Email đã tồn tại. Vui lòng nhập lại")
        res.redirect(req.get('Referrer'))
    }else{
        if(req.body.password){
            req.body.password = md5(req.body.password)
        }else{
            delete req.body.password
        }
        await Account.updateOne({_id: id},req.body)

        req.flash("success","Cập nhật tài khoản thành công")
    }
    res.redirect(req.get('Referrer'))
}