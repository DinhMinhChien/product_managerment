const Cart = require("../../models/cart_model")
const Product = require("../../models/product_model")
const Order = require("../../models/order_model");

const productsHelper = require("../../helpers/products")
//[GET] /checkout/
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
    res.render("client/pages/checkout/index",{
        pageTitle: "Đặt hàng",
        cartDetail: cart
    })
}
module.exports.order = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = req.body;

    const cart = await Cart.findOne({ _id: cartId });

    // 1. Kiểm tra tồn kho
    for (const item of cart.products) {
        const productInfo = await Product.findOne({ _id: item.product_id });

        if (!productInfo) {
            return res.send("Sản phẩm không tồn tại!");
        }

        if (productInfo.stock < item.quantity) {
            const errorMessage = `Sản phẩm: **${productInfo.title}** không đủ số lượng! Tồn kho hiện tại: **${productInfo.stock}**. Vui lòng kiểm tra lại giỏ hàng.`;
            req.flash('error', errorMessage);
            
            return res.redirect('/checkout');
        }
    }

    // 2. Trừ tồn kho
    for (const item of cart.products) {
        await Product.updateOne(
            { _id: item.product_id },
            { $inc: { stock: -item.quantity } }
        );
    }

    // 3. Chuẩn bị dữ liệu sản phẩm để tạo order
    let products = [];
    for (const product of cart.products) {
        const productInfo = await Product.findOne({ _id: product.product_id });

        products.push({
            product_id: product.product_id,
            price: productInfo.price,
            discountPercentage: productInfo.discountPercentage,
            quantity: product.quantity
        });
    }

    // 4. Tạo đơn hàng
    const order = new Order({
        cart_id: cartId,
        userInfo,
        products
    });
    await order.save();

    // 5. Clear giỏ hàng
    await Cart.updateOne(
        { _id: cartId },
        { products: [] }
    );

    // 6. Redirect
    res.redirect(`/checkout/success/${order.id}`);
};


module.exports.success = async (req, res) => {
    const order = await Order.findOne({ _id: req.params.orderId });

    for (const product of order.products) {
        const productInfo = await Product.findOne({
            _id: product.product_id
        }).select("title thumbnail price discountPercentage");

        product.productInfo = productInfo;
        product.priceNew = productsHelper.priceNewProduct(product);
        product.totalPrice = (product.priceNew * product.quantity).toFixed(2);
    }

    order.totalPrice = order.products.reduce((sum, item) => 
        sum + parseFloat(item.totalPrice), 0
    ).toFixed(2);

    // realtime
    const io = req.app.get("io");
    const allOrders = await Order.find().sort({ createdAt: -1 });

    const totalOrders = allOrders.length;

    const totalRevenue = allOrders.reduce((sum, od) => {
        const orderTotal = od.products.reduce((acc, p) => {
            const priceAfterDiscount = p.price * (1 - p.discountPercentage / 100);
            return acc + priceAfterDiscount * p.quantity;
        }, 0);
        return sum + orderTotal;
    }, 0);

    const latestOrders = allOrders
        .filter(o => o.status === "Đang xử lí" || o.status === "Đang giao hàng")
        .slice(0, 5)
        .map(o => {
            const orderTotal = o.products.reduce((acc, p) => {
                const priceAfterDiscount = p.price * (1 - p.discountPercentage / 100);
                return acc + priceAfterDiscount * p.quantity;
            }, 0);

            return {
                id: o._id.toString(),
                customer: o.userInfo ? o.userInfo.fullName : "Không có",
                total: orderTotal,
                status: o.status,
                time: o.createdAt
            };
        });

    io.emit("newOrder", {
        totalOrders,
        totalRevenue,
        latestOrders
    });

    res.render("client/pages/checkout/success", {
        pageTitle: "Đặt hàng thành công",
        order
    });
};



