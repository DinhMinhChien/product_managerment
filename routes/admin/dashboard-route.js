const express = require("express");
const router = express.Router();
const Order = require("../../models/order_model");
const controller = require("../../controllers/admin/dashboard-controller")

// Trang dashboard admin
router.get("/",controller.dashboard);
router.get("/order/:status/:orderId",controller.status);

module.exports = router;
