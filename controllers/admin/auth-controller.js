const md5 = require('md5');
const Account = require("../../models/account_model")
const systemConfig = require("../../config/system")

module.exports.login = (req,res) => {
    if(req.cookies.token){
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    }else{
        res.render("admin/pages/auth/login",{
            pageTitle: "Trang đăng nhập"
        });
    }
    
}
module.exports.loginPost = async (req,res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await Account.findOne({
        email: email,
        deleted: false
    })
    if(!user){
        req.flash("error","Email không tồn tại")
        res.redirect(req.get('Referrer'))
        return
    }
    if(md5(password) != user.password){
        req.flash("error","Mật khẩu không chính xác.Vui lòng nhập lại mật khẩu")
        res.redirect(req.get('Referrer'))
        return
    }
    if(user.status == "inactive"){
        req.flash("error","Tài khoản đang bị khoá")
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
