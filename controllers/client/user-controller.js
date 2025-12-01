const md5 = require('md5');
const User = require("../../models/user_model")
const Cart = require("../../models/cart_model")
//[GET]
module.exports.register = (req,res) => {
    res.render("client/pages/user/register",{
        pageTitle: " Trang đăng ký",
    });
}
//[POST]
module.exports.registerPost = async (req, res) => {
    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if(existEmail) {
        req.flash("error", `Email đã tồn tại!`);
        res.redirect(req.get('Referrer'))
        return;
    }

    req.body.password = md5(req.body.password);

    const user = new User(req.body);

    await user.save();

    res.cookie("tookenUser", user.tokenUser);

    res.redirect("/user/login");
};
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập tài khoản",
    }); 
};
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if(!user) {
        req.flash("error", `Email không tồn tại!`);
        res.redirect(req.get('Referrer'))
        return;
    }

    if(md5(password) != user.password) {
        req.flash("error", `Sai mật khẩu!`);
        res.redirect(req.get('Referrer'))
        return;
    }

    if(user.status == "inactive") {
        req.flash("error", `Tài khoản đang bị khóa!`);
        res.redirect(req.get('Referrer'))
        return;
    }

    res.cookie("tokenUser", user.tokenUser);
    await Cart.updateOne({
        _id: req.cookies.cartId
    }, {
        user_id: user.id
    });

    res.redirect("/");
};
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");
    res.redirect("/");
};