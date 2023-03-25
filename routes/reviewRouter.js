const express = require('express');

const router = express.Router();
const reviewController = require('../controllers/reviewController');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const recaptchaV3 = require('../utilities/reCaptcha');

// Kiểm tra đăng nhập trước khi post bằng middleware login
router.post('*', userController.isLoggedInContinuous);

// Đăng review
router.post('/', async (req, res, next) => {
    try {
        // Xử lý capcha
        recaptchaV3.verify(req, async (error, data) => {
            let review = {
                message: req.body.message,
                rating: req.body.rating,
                productId: req.body.productId,
                userId: req.body.userId,
            };
            if (error || data.score < 0.5) {
                res.redirect(`/products/${review.productId}#review`);
                return;
            }
            // Nếu không có userIs hoặc rating sai thì không xử lý
            if (!review.userId || Number.isNaN(review.rating) || review.rating < 1 || review.rating > 5) {
                res.redirect(`/products/${review.productId}#review`);
                return;
            }
            review = await reviewController.add(review);
            res.redirect(`/products/${review.productId}#review`);
            const product = await productController.getByIdWithReview(review.productId);
            const reviews = product.Reviews;
            const reviewCount = reviews.length;
            let sumRating = 0;
            for (let i = 0; i < reviewCount; i += 1) {
                sumRating += reviews[i].rating;
            }
            const overallReview = sumRating / reviewCount;
            product.overallReview = overallReview.toFixed(2);
            product.reviewCount = reviewCount;
            productController.update(product);
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
