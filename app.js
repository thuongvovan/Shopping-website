// import module
const express = require('express');
const expressHbs = require('express-handlebars');
const logger = require('morgan');
const compression = require('compression');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express(); // express instance
app.set('port', process.env.PORT || 3000); // Set server port
const createError = require('http-errors');
const hbsHelper = require('./utilities/handlebarsUtilities');
const routers = require('./routes/index');

// ------------ Config middleware -----------------
// log http request
// app.use(logger('dev'));
// Public static folder
app.use(express.static('public'));
// view engine
const hbs = expressHbs.engine({
    // handlebars: handlebars, //Handlebars: Access has been denied to resolve the property "....." because it is not an "own property" of its parent.
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials',
    helpers: hbsHelper,
    runtimeOptions: { allowProtoPropertiesByDefault: true },
});

app.engine('hbs', hbs);
app.set('view engine', 'hbs');
app.set('views', './views');
// --------------- Parser  ------------------
app.use(express.json()); // bodyParser.json()
app.use(express.urlencoded({ extended: false })); // bodyParser.urlencoded()
app.use(cookieParser());

// ------------ compress all responses ----------------
app.use(compression());

// --------------- Session  ------------------
// Tạo ta một bộ nhớ session ở server (phân biệt session storage ở browser)
// session này phân biệt người dùng bằng môt mã (lưu tại tên cookie là: connect.sid) ở bộ nhớ cookie (trao đổi giữa client-server)
app.use(
    session({
        cookie: {
            httpOnly: true, // Không cho browser truy cập cookie
            maxAge: null, // 30 * 24 * 60 * 60, // Thời hạn của cookie
        },
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
    }),
);

// --------------- Cart controller  ------------------
const Cart = require('./controllers/cartController');

app.use((req, res, next) => {
    // Khởi tạo giỏ hàng trống nếu trong session chưa lưu giỏ hảng
    // Nếu đã lưu giỏ hàng thì tiếp tục cập nhật
    const cart = new Cart(req.session.cart || {});
    req.session.cart = cart;
    res.locals.totalQuantity = req.session.cart.getTotalQuantity();
    // Lưu tên người dùng và tình trạng đăng nhập
    // Từ session sang locals storage
    res.locals.fullname = req.session.user ? req.session.user.fullname : '';
    res.locals.userId = req.session.user ? req.session.user.id : null;
    res.locals.isLoggedIn = !!req.session.user;
    // Chuyển sang middware tiếp theo
    next();
});

// --------------- Routes  ------------------
app.use('/products', routers.productRouter);
app.use('/cart', routers.cartRouter);
app.use('/comments', routers.commentRouter);
app.use('/review', routers.reviewRouter);
app.use('/user', routers.userRouter);
app.use('/contact', routers.contactRouter);
app.use('/', routers.indexRouter); // Để sau vì có route theo page

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    // set locals, don’t provide error detail in production
    if (process.env.ENV === 'production') {
        res.locals.errorMessage = 'Internal Server Error';
        res.locals.errorStatus = 500;
        if (err.status === 404) {
            res.locals.errorMessage = err.message;
            res.locals.errorStatus = err.status;
        }
        res.render('error');
        return;
    }
    res.locals.errorMessage = err.message;
    res.locals.errorStatus = err.status;
    res.locals.errorStack = err.stack;
    res.render('error');
});

// ---------------- Start server --------------------------
app.listen(app.get('port'), () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running at port ${app.get('port')}`);
});
