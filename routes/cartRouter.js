const express = require('express');

const router = express.Router();
const productController = require('../controllers/productController');
require('../utilities/arrayUtilities');

// Xem giỏ hàng
router.get('/', (req, res, next) => {
    try {
        const { cart } = req.session;
        res.locals.cart = cart.getCart();
        res.locals.banner = 'Cart';
        res.render('cart');
    } catch (error) {
        next(error);
    }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const product = await productController.getById(productId);
        req.session.cart.add(product, productId, quantity);
        res.json({ totalQuantity: req.session.cart.totalQuantity });
    } catch (error) {
        next(error);
    }
});

// Cập nhật giỏ hàng
router.put('/', (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const cartItem = req.session.cart.update(productId, quantity);
        res.json(cartItem);
    } catch (error) {
        next(error);
    }
});

// Xóa sản phẩm trong giỏ hàng
router.delete('/', (req, res, next) => {
    try {
        const { productId } = req.body;
        req.session.cart.remove(productId);
        res.json({
            totalQuantility: req.session.cart.totalQuantity,
            totalPrice: req.session.cart.totalPrice,
        });
    } catch (error) {
        next(error);
    }
});

// Xóa toàn bộ giỏ hàng
router.delete('/all', (req, res, next) => {
    try {
        req.session.cart.empty();
        res.sendStatus(204);
        res.end();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
