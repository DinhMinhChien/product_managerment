const flash = require('express-flash')
const express = require('express');
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

// Kết nối DB
database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//flash
app.use(cookieParser("cdvjcdbia"))
app.use(session({ cookie: { maxAge: 60000 } }))
app.use(flash())
//end flash

//tinymce
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
//end tinymce

app.locals.prefixAdmin = systemConfig.prefixAdmin
app.locals.moment = moment

app.use(express.static(`${__dirname}/public`));

// Routes
routeAdmin(app);
route(app);

const http = require("http");
const { Server } = require("socket.io");

// Tạo http server từ express
const server = http.createServer(app);

// Khởi tạo socket.io
const io = new Server(server);
app.set("io", io);

// Lắng nghe kết nối từ client (trang admin)
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);

  // Ví dụ: gửi sự kiện test
  socket.emit("welcome", { msg: "Chào admin, socket đã kết nối!" });
});

// Chạy server
server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// Xuất io để dùng ở chỗ khác (ví dụ khi có đơn hàng mới)
module.exports = io;

