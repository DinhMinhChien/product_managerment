const Cart = require("../../models/cart_model")
const Product = require("../../models/product_model")
const productsHelper = require("../../helpers/products")
module.exports.index = async (req,res) => {
    const cartId = req.cookies.cartId
    const cart = await Cart.findOne({
        _id: cartId
    })
    if(cart.products.length){
        for (const item of cart.products) {
            const productId= item.product_id

            const productInfo = await Product.findOne({
                _id: productId
            })
            productInfo.priceNew = productsHelper.priceNewProduct(productInfo)
            item.productInfo = productInfo

            item.totalPrice = (item.quantity * productInfo.priceNew).toFixed(2)
        }
    }
    cart.totalPrice = cart.products.reduce((sum,item) => sum + parseFloat(item.totalPrice),0).toFixed(2)
    res.render("client/pages/cart/index",{
        pageTitle: "Giỏ hàng",
        cartDetail: cart
    })
}



//[POST] /cart/add/:productId 
module.exports.addPost = async (req,res) => {
    const cartId = req.cookies.cartId
    const productId = req.params.productId
    console.log(productId)
    const quantity = parseInt(req.body.quantity)

    const cart = await Cart.findOne({
        _id: cartId
    })

    const existProductInCart = cart.products.find(item => item.product_id == productId)
    
    if(existProductInCart){
        const newQuantity = quantity + existProductInCart.quantity
        await Cart.updateOne(
            {
                _id: cartId,
                'products.product_id': productId
            },
            {
                'products.$.quantity': newQuantity
            }
        )
    }else{
        const objectCart = {
            product_id: productId,
            quantity: quantity
        }
        await Cart.updateOne(
            {
                _id: cartId
            },
            {
                $push: {products: objectCart}
            }
        )
    }
    req.flash("success","Thêm vào giỏ hàng thành công!")
    res.redirect(req.get('Referrer'));
}

//[GET] /cart/delete/:productId
module.exports.delete = async (req,res) => {
    const productId = req.params.productId
    const cartId = req.cookies.cartId
    await Cart.updateOne({
        _id: cartId
    },{
        "$pull": {products: {"product_id": productId}}
    })
    req.flash("success","Xoá sản phẩm thành công khỏi giỏ hàng")
    res.redirect(req.get('Referrer'));
}

module.exports.update = async (req,res) => {
    const productId = req.params.productId
    const cartId = req.cookies.cartId
    const quantity = req.params.quantity
    await Cart.updateOne(
            {
                _id: cartId,
                'products.product_id': productId
            },
            {
                'products.$.quantity': quantity
            }
        )
    req.flash("success","Cập nhật số lượng thành công ")
    res.redirect(req.get('Referrer'));
}