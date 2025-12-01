const Order = require("../../models/order_model")
const Product = require("../../models/product_model")
module.exports.order =  async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        const products = await Product.find();

        // Tạo map từ product_id -> title
        const productMap = {};
        products.forEach(p => {
            productMap[p._id.toString()] = p.title;
        });

        // Gắn thêm tên sản phẩm vào từng order
        const ordersWithNames = orders.map(order => {
            const newProducts = order.products.map(p => ({
            ...p.toObject(),
            product_title: productMap[p.product_id] || "Không rõ"
            }));

            const total = newProducts.reduce((acc, p) => {
            const priceAfterDiscount = p.price * (1 - p.discountPercentage / 100);
            return acc + priceAfterDiscount * p.quantity;
            }, 0);

            return { ...order.toObject(), products: newProducts, total };
        });

        res.render("admin/pages/order/index", { orders: ordersWithNames });
    } catch (err) {
        res.status(500).send(err.message);
    }
}
