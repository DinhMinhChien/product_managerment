const Product = require("../../models/product_model")
const productsHelper = require("../../helpers/products")
module.exports.index = async (req,res) => {
    //lấy ra sản phẩm nổi bật 
    const productFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    })
    const newProductFeatured= productsHelper.priceNewProducts(productFeatured)

    // hiển thị danh sách sản phẩm mới nhất
    const productsNew = await Product.find({
        deleted: false,
        status: "active"
    }).sort({position: "desc"}).limit(8)
    const newProductsNew= productsHelper.priceNewProducts(productsNew)


    res.render("client/pages/home/index",{
        pageTitle: "Trang chủ",
        productFeatureds: newProductFeatured,
        productsNew: newProductsNew
    });
}
