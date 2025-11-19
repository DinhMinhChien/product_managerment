const md5 = require('md5');
const Account = require("../../models/account_model")
const systemConfig = require("../../config/system")



module.exports.login = (req,res) => {
    res.render("admin/pages/auth/login",{
        pageTitle: "Trang đăng nhập"
    });
}
module.exports.loginPost = async (req,res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await Account.findOne({
        email: email,
        deleted: false
    })
    if(!user){
        res.flash("error","Email không tồn tại")
        res.redirect(req.get('Referrer'))
        return
    }
    if(md5(password) != user.password){
        res.flash("error","Mật khẩu không chính xác.Vui lòng nhập lại mật khẩu")
        res.redirect(req.get('Referrer'))
        return
    }
    if(user.status == "inactive"){
        res.flash("error","Tài khoản đang bị khoá")
        res.redirect(req.get('Referrer'))
        return
    }
    res.cookie("token",user.token)
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
}
module.exports.logout = (req,res) => {
    res.clearCookie("token")
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
}
