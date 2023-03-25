const express = require('express');

const router = express.Router();
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const brandController = require('../controllers/brandController');
const colorController = require('../controllers/colorController');
require('../utilities/arrayUtilities');
const recaptchaV3 = require('../utilities/reCaptcha');

// Hiển thị trang product
router.get('/', async (req, res, next) => {
    try {
        let products;
        let topProducts;
        // Thực hiện truy vấn đồng thời nhiều thông tin để tối ưu thời gian load trang web
        [res.locals.categories, res.locals.brands, res.locals.colors, products, topProducts] = await Promise.all([
            categoryController.countProduct(req.query),
            brandController.countProduct(req.query),
            colorController.countProduct(req.query), //
            productController.getAll(req.query),
            productController.getTop(),
        ]);

        // Lấy dữ liệu của sản phẩm
        res.locals.products = products.rows;
        // Phân trang
        res.locals.pagination = {
            page: parseInt(req.params.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 9,
            totalRows: products.count,
        };
        res.locals.topProducts = topProducts.paginate(3, 4);
        res.locals.banner = 'Shop';
        res.render('category');
    } catch (error) {
        next(error);
    }
});

// Hiển thị trang một sản phẩm
router.get('/:productId', async (req, res, next) => {
    try {
        const { productId } = req.params;
        // Tương tự cũng thực hiện các truy vấn song song
        let topProducts;
        [res.locals.product, topProducts] = await Promise.all([
            productController.getByIdWithProperty(productId),
            productController.getTop(),
        ]);
        // Nếu đã đăng nhập thì hiển thị lại review
        if (req.session.user) {
            const { userId } = req.session.user;
            res.locals.currentReview = res.locals.product.Reviews.find(
                (review) => review.productId === productId && review.userId === userId,
            );
        }
        // Xử lý Top product
        res.locals.topProducts = topProducts.paginate(3, 4);
        // capcha
        res.locals.captcha = recaptchaV3.render();
        // render
        res.locals.banner = 'Shop';
        res.render('single-product');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
