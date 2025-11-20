const md5 = require('md5');
const Account = require("../../models/account_model")
module.exports.index = async(req,res) => {
    res.render("client/pages/auth/signup",{
        pageTitle: "Trang đăng kí tài khoản"
    });
}
module.exports.signupPost = async(req,res) => {
    req.body.password = md5(req.body.password);
    const record = new Account(req.body)
    await record.save();
    req.flash("success","Đăng kí thành công")
    res.redirect("/signup")
}