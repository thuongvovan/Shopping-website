const express = require('express');

const router = express.Router();
const commentController = require('../controllers/commentController');
const userController = require('../controllers/userController');
const recaptchaV3 = require('../utilities/reCaptcha');

// Kiểm tra đăng nhập trước khi post
router.post('*', userController.isLoggedInContinuous);

// Post comment
router.post('/', async (req, res, next) => {
    try {
        // Xử lý capcha
        recaptchaV3.verify(req, async (error, data) => {
            let comment = {
                userId: req.body.userId,
                productId: req.body.productId,
                message: req.body.message,
                parentCommentId: Number.isNaN(parseInt(req.body.parentCommentId, 10))
                    ? null
                    : parseInt(req.body.parentCommentId, 10),
            };
            // Nếu phát hiện là bot
            if (error || data.score < 0.5) {
                res.redirect(`/products/${comment.productId}#commentForm`);
                return;
            }
            // Nếu comment trống thì bỏ qua không xử lý
            if (comment.message.trim() !== '') {
                comment = await commentController.add(comment);
            }
            res.redirect(`/products/${comment.productId}#commentForm`);
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
