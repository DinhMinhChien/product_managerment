const Order = require("../../models/order_model")
const Product = require("../../models/product_model")
// [GET] /admin/dashboard

module.exports.dashboard = async (req, res) => {
    try {
    const orders = await Order.find().sort({ createdAt: -1 });

    // Tổng số đơn hàng
    const totalOrders = orders.length;

    // Doanh thu (tính theo tất cả đơn hàng)
    const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.products.reduce((acc, p) => {
        const priceAfterDiscount = p.price * (1 - p.discountPercentage / 100);
        return acc + priceAfterDiscount * p.quantity;
        }, 0);
        return sum + orderTotal;
    }, 0);

    const latestOrders = orders.slice(0, 5).map(order => {
        const orderTotal = order.products.reduce((acc, p) => {
        const priceAfterDiscount = p.price * (1 - p.discountPercentage / 100);
        return acc + priceAfterDiscount * p.quantity;
        }, 0);
        return {
            id: order._id,
            customer: order.userInfo.fullName,
            total: orderTotal,
            status: order.status,
            time: order.createdAt
        };
    });
    const lowStockProducts = await Product.find({
        deleted: false,
        stock: { $lt: 20 }
    }).sort({stock: "asc"})

    res.render("admin/pages/dashboard/index", {
        totalOrders,
        totalRevenue,
        latestOrders,
        lowStockProducts
    });
    } catch (err) {
        res.status(500).send(err.message);
    }
}
module.exports.status = async (req, res) => {
    const status = req.params.status;
    const orderId = req.params.orderId;

    await Order.updateOne(
        { _id: orderId },
        { status: status }
    );
    req.flash("success","Cập nhật thành công")
    res.redirect(req.get('Referrer'));
};

