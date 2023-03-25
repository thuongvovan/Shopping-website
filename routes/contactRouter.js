const express = require('express');
const messageController = require('../controllers/messageController');
const { messageSchema } = require('../utilities/dataValidations/dataValidator');
const recaptchaV3 = require('../utilities/reCaptcha');

const router = express.Router();

router.get('/', (req, res) => {
    res.locals.captcha = recaptchaV3.render();
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    res.locals.banner = 'Contact';
    res.render('contact');
});

router.post('/', (req, res, next) => {
    try {
        recaptchaV3.verify(req, async (error, data) => {
            res.locals.captcha = recaptchaV3.render();
            res.locals.banner = 'Contact';
            // Nếu là bot
            if (error || data.score < 0.5) {
                res.locals.message = 'Bot Detected';
                res.locals.type = 'danger';
                res.render('contact');
                return;
            }
            const messageData = {};
            messageData.name = req.body.name;
            messageData.email = req.body.email;
            messageData.subject = req.body.subject;
            messageData.message = req.body.message;

            const validateResult = messageSchema.validate(messageData);
            // Kiểm tra người dùng bỏ trống các thông tin không
            if (validateResult.error) {
                // Nếu có bỏ trống thông tin thì
                // hiển thị lại thông tin người dùng đã nhập để tiếp tục nhập tiếp
                res.locals.message = validateResult.error.message;
                res.locals.type = 'danger';
                res.render('contact');
                return;
            }

            if (req.session.user) {
                messageData.userId = req.session.user.userId;
                messageData.email = req.session.user.username;
                messageData.name = req.session.user.fullname;
                res.locals.user = req.session.user;
            }
            await messageController.add(messageData);
            res.locals.message = 'Thanks for your opinion, I will pay attention to it.';
            res.locals.type = 'success';
            res.render('contact');
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
