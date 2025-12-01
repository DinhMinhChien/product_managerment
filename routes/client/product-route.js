const express = require ("express");
const route = express.Router();

const controller = require("../../controllers/client/product-controller")

route.get("/",controller.index);

route.get("/:slugCategory",controller.category);

route.get("/detail/:slugProduct",controller.detail);


module.exports = route;
