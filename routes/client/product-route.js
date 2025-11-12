const express = require ("express");
const route = express.Router();

const controller = require("../../controllers/client/product-controller")

route.get("/",controller.index);

route.get("/:slug",controller.detail);

module.exports = route;
