const flash = require('express-flash')
const express = require ('express');
const path = require('path')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const bodyParser = require("body-parser")
const database = require("./config/database");
require("dotenv").config();
const route = require("./routes/client/index-route")
const systemConfig = require("./config/system");
const routeAdmin = require("./routes/admin/index-route")
const moment = require('moment')
database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride('_method'))

app.use(bodyParser.urlencoded({ extended: false}));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//flash
app.use(cookieParser("cdvjcdbia"))
app.use(session({cookie: {maxAge: 60000}}))
app.use(flash())
//end flash

//tinymce
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
//end tinymce

app.locals.prefixAdmin = systemConfig.prefixAdmin
app.locals.moment = moment
app.use(express.static(`${__dirname}/public`));


//Routes
routeAdmin(app);
route(app);

app.listen(port,() => {
    console.log(`app listening on port ${port}`)
})