module.exports.createPost = (req,res,next) => {
    if(!req.body.title){
        req.flash("error","vui lòng nhập tiêu đề sản phẩm")
        res.redirect(req.get('Referrer')); 
        return;
    }
    next();
}