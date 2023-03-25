const express = require('express');

const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

router.get('/', async (req, res, next) => {
    try {
        [res.locals.categories, res.locals.products] = await Promise.all([
            categoryController.getAll(),
            productController.getTrending(),
        ]);
        res.locals.banner = 'Home';
        res.render('index');
    } catch (error) {
        next(error);
    }
});

// Render static html file
// router.get('/:page', (req, res, next) => {
//     try {
//         const banners = {
//             blog: 'Our Blog',
//             cart: 'Shopping Cart',
//             category: 'Shop Category',
//             checkout: 'Product Checkout',
//             confirmation: 'Order Confirmation',
//             contact: 'Contact Us',
//             login: 'Login / Register',
//             register: 'Register',
//             'single-blog': 'Blog Details',
//             'single-product': 'Shop Single',
//             'tracking-order': 'Order Tracking',
//         };
//         const { page } = req.params;
//         res.render(page, { banner: banners[page] });
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;
