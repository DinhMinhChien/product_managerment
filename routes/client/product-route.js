const express = require ("express");
const route = express.Router();

const controller = require("../../controllers/client/product-controller")

route.get("/",controller.index);

route.get("/:slug",controller.detail);

route.post("/:slug/purchase",controller.purchase)

route.post("/order-success/:id/:quantity", controller.orderSuccess);

module.exports = route;
