const Product = require("../../models/product_model")
const searchHelper = require("../../helpers/search")
const paginationHelper = require("../../helpers/pagination")
// [GET] /products
module.exports.index = async(req,res) => {
    let find = {
        status: "active",
        deleted: false
    }
    let objectSearch = searchHelper(req.query)
    if(objectSearch.regex){
        find.title = objectSearch.regex
    }
    const countProducts = await Product.countDocuments(find)

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 6
        },
        req.query,
        countProducts
    );

    const products = await Product.find(find).sort({position:"desc"}).limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

    const newProduct = products.map(item => {
        item.priceNew = (item.price*(100-item.discountPercentage)/100).toFixed(2);
        return item;
    })
    res.render("client/pages/products/index",{
        pageTitle: "Danh sách sản phẩm",
        products: newProduct,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}
//[GET] /products/detail
module.exports.detail = async(req,res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slug,
            status: "active"
        }
        
        const product = await Product.findOne(find)
        res.render("client/pages/products/detail",{
            pageTitle: product.title,
            product: product,
        })
    } catch (error) {
        res.redirect(`/products`)
    }
}
module.exports.purchase = async(req,res) => {
    const slug = req.params.slug
    const quantity = req.body.quantity
    const product = await Product.findOne({slug: slug})
    const totalPrice = ((product.price*(100-product.discountPercentage)/100)*quantity).toFixed(2)
    res.render("client/pages/products/purchase",{
        pageTitle: product.title,
        product: product,
        totalPrice: totalPrice,
        quantity: quantity
    })
}
module.exports.orderSuccess = async(req,res) => {
    const shippingAddress = req.body.address
    const payment_method = req.body.payment_method
    const id = req.params.id
    const product = await Product.findOne({_id: id});
    const quantity = req.params.quantity
    const totalAmount = ((product.price*(100-product.discountPercentage)/100)*quantity).toFixed(2)
    res.render("client/pages/products/success",{
        shippingAddress: shippingAddress,
        totalAmount: totalAmount,
        orderCode: id,
        payment_method: payment_method
    })
}
