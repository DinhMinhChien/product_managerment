const md5 = require('md5');
const Account = require("../../models/account_model")
// [GET] /admin/my-account

module.exports.index = (req,res) => {
    res.render("admin/pages/my-account/index",{
        pageTitle: "Thông tin cá nhân"
    });
}
module.exports.edit = (req,res) => {
    res.render("admin/pages/my-account/edit",{
        pageTitle: "Cập nhật thông tin cá nhân"
    });
}
module.exports.editPatch = async (req,res) => {

    const id = res.locals.user.id
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
