module.exports.loginPost = (req,res,next) => {
    if(!req.body.email){
        req.flash("error","vui lòng nhập email")
        res.redirect(req.get('Referrer')); 
        return;
    }
    if(!req.body.password){
        req.flash("error","vui lòng nhập mật khẩu")
        res.redirect(req.get('Referrer')); 
        return;
    }
    next();
}