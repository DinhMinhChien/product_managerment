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

    const cart = await Cart.findOne({
        _id: cartId 
    });

    let products = [];

    for (const product of cart.products) {
        const objectProduct = {
            product_id: product.product_id,
            price: 0,
            discountPercentage: 0,
            quantity: product.quantity
        };

        const productInfo = await Product.findOne({
            _id: product.product_id
        });

        objectProduct.price = productInfo.price;
        objectProduct.discountPercentage = productInfo.discountPercentage;

        products.push(objectProduct);
    }

    const objectOrder = {
        cart_id: cartId,
        userInfo: userInfo,
        products: products
    };

    const order = new Order(objectOrder);
    await order.save();

    await Cart.updateOne({
        _id: cartId
    }, {
        products: []
    });

    res.redirect(`/checkout/success/${order.id}`);
}

module.exports.success = async (req, res) => {
    const order = await Order.findOne({ _id: req.params.orderId });

    // Xử lý từng sản phẩm trong đơn
    for (const product of order.products) {
        const productInfo = await Product.findOne({
            _id: product.product_id
        }).select("title stock thumbnail");

        product.productInfo = productInfo;

        product.priceNew = productsHelper.priceNewProduct(product);
        product.totalPrice = (product.priceNew * product.quantity).toFixed(2);

        if (productInfo.stock < product.quantity) {
            return res.send("Số lượng đặt vượt quá tồn kho!");
        }

        await Product.updateOne(
            { _id: product.product_id },
            { $inc: { stock: -product.quantity } }
        );
    }

    // Tổng giá trị đơn hàng
    order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);
    order.totalPrice = parseFloat(order.totalPrice).toFixed(2);

    // ========== REALTIME ========== //
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

    // Lấy 5 đơn mới nhất và map thành đúng cấu trúc client cần
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

    // Render trang thành công
    res.render("client/pages/checkout/success", {
        pageTitle: "Đặt hàng thành công",
        order: order
    });
};


