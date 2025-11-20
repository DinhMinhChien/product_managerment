const productRoutes = require("./product-route");
const homeRoutes = require("./home-route");
// const signUpRoutes = require("./sign-up-route");
module.exports = (app) => {
    app.use('/',homeRoutes);
    app.use('/products',productRoutes);
    // app.use('/signup',signUpRoutes);
}