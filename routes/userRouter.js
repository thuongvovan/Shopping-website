const express = require('express');
const userController = require('../controllers/userController');
const { userSchema, passwordSchema, userNormalizer } = require('../utilities/dataValidations/dataValidator');
const { nameNormalizer } = require('../utilities/dataValidations/nameValidator');
const { registerTokenCreater, forgotPasswordTokenCreater, tokenVerifier } = require('../utilities/tokenCreator');
const { createSiteURL } = require('../utilities/siteUtilities');
const mailer = require('../utilities/mailer');
const recaptchaV3 = require('../utilities/reCaptcha');

require('dotenv').config();

const router = express.Router();

// Vào trang đang nhập
router.get('/login', userController.isLoggedInReverse, (req, res) => {
    // Lưu lại thông tin trang trước khi đăng nhập
    req.session.returnUrl = req.query.returnUrl;
    res.locals.captcha = recaptchaV3.render();
    res.locals.banner = 'Login';
    res.render('login');
});

// Thực hiện đăng nhập
router.post('/login', async (req, res, next) => {
    try {
        // Xử lý capcha
        recaptchaV3.verify(req, async (error, data) => {
            const { username, password } = req.body;
            const keepLoggedIn = req.body.keepLoggedIn !== undefined;
            const user = { username, password, keepLoggedIn };
            res.locals.banner = 'Login';
            res.locals.user = user;
            res.locals.captcha = recaptchaV3.render();
            // Nếu là bot
            if (error || data.score < 0.5) {
                res.locals.message = 'Bot Detected';
                res.locals.type = 'danger';
                res.render('login');
                return;
            }

            // Nếu không nhập username hoặc password
            if (!username || username.trim() === '' || !password || password.trim() === '') {
                res.locals.message = 'Username or password is missing!';
                res.locals.type = 'danger';
                res.render('login');
                return;
            }

            // Xác thực người dùng
            const authen = await userController.authentication(user);
            // Nếu kết quả xác thực là đúng lưu người dùng vào bộ nhớ session
            if (authen.result) {
                req.session.user = authen.user;
                req.session.cookie.maxAge = keepLoggedIn ? 30 * 24 * 60 * 60 : null;
                if (req.session.returnUrl) {
                    // Trở về trang trước khi đăng nhập
                    res.redirect(req.session.returnUrl);
                } else {
                    res.redirect('/');
                }
                // Nếu xác thực bị sai trả lại kết quả đã nhập về để hỗ trợ người dùng chỉnh sửa
            } else {
                res.locals.message = authen.message;
                res.locals.type = authen.type;
                res.render('login');
            }
        });
    } catch (error) {
        next(error);
    }
});

// Vào trang đăng ký
router.get('/register', (req, res) => {
    res.locals.captcha = recaptchaV3.render();
    res.locals.banner = 'Register';
    res.render('register');
});

// Thực hiện đăng ký
router.post('/register', async (req, res, next) => {
    try {
        // Xử lý capcha
        recaptchaV3.verify(req, async (error, data) => {
            // Lấy các giá trị người đùng đã nhập
            const user = {
                username: userNormalizer(req.body.username),
                fullname: nameNormalizer(req.body.fullname),
                password: req.body.password,
                confirmPassword: req.body.confirmPassword,
            };
            res.locals.banner = 'Register';
            res.locals.user = user;
            res.locals.captcha = recaptchaV3.render();

            // Nếu là bot
            if (error || data.score < 0.5) {
                res.locals.message = 'Bot Detected';
                res.locals.type = 'danger';
                res.render('login');
                return;
            }

            // Kiểm tra cấu trúc thông tin đăng ký
            const validateResult = userSchema.validate(user);

            // Kiểm tra người dùng bỏ trống các thông tin không
            if (validateResult.error) {
                // Nếu có bỏ trống thông tin thì
                // hiển thị lại thông tin người dùng đã nhập để tiếp tục nhập tiếp
                res.locals.message = validateResult.error.message;
                res.locals.type = 'danger';
                res.render('register');
                return;
            }

            // Kiểm tra username tồn tại chưa
            const currentUser = await userController.getAllByUserName(user.username);
            if (currentUser) {
                if (currentUser.isVerified) {
                    // Nếu đã tồn tại trả về cảnh báo
                    // hiển thị lại thông tin người dùng đã nhập để tiếp tục nhập tiếp
                    res.locals.message = 'User name is already used';
                    res.locals.type = 'danger';
                    res.render('register');
                    return;
                }
                // Nếu như chưa verify
                userController.updateUser(currentUser, validateResult.value);
            } else {
                userController.createUser(validateResult.value);
            }
            res.locals.user = validateResult.value;
            const url = createSiteURL();
            const token = registerTokenCreater({ username: validateResult.value.username });
            const confirmationUrl = `${url}/user/register/${token}`;
            res.render('register-inform', { url });
            mailer(validateResult.value.username, 'Email Verification', 'register-confirmation', {
                confirmationUrl,
                url,
                fullname: validateResult.value.fullname,
            });
        });
    } catch (error) {
        next(error);
    }
});

// Xác thực email
router.get('/register/:token', async (req, res, next) => {
    const { token } = req.params;
    try {
        const info = tokenVerifier(token);
        if (info.type !== 'register-verify') {
            next();
            return;
        }
        const user = await userController.setVerifiedUser(info.username);
        if (user) {
            res.locals.user = user;
            res.locals.banner = 'Register successfuly';
            res.render('register-success');
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// xử lý logout
router.get('/logout', userController.isLoggedIn, (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            next(err);
            return;
        }
        res.redirect('/user/login');
    });
});

// màn hình quên mật khẩu
router.get('/forgot-password', (req, res, next) => {
    try {
        res.locals.banner = 'Forgot password';
        res.render('forgot-password');
    } catch (error) {
        next(error);
    }
});

// Xử lý quên mật khẩu
router.post('/forgot-password', async (req, res, next) => {
    try {
        // Xử lý capcha
        recaptchaV3.verify(req, async (error, data) => {
            // Lấy các giá trị người đùng đã nhập
            const username = userNormalizer(req.body.username);

            res.locals.captcha = recaptchaV3.render();
            res.locals.banner = 'Forgot password';
            // Nếu là bot
            if (error || data.score < 0.5) {
                res.locals.message = 'Bot Detected';
                res.locals.type = 'danger';
                res.render('forgot-password');
                return;
            }

            const user = await userController.getByUserName(username);
            if (!user) {
                res.locals.username = username;
                res.locals.message = 'Your email address does not exist.';
                res.locals.type = 'danger';
                res.render('forgot-password');
                return;
            }
            res.locals.user = user;
            const url = createSiteURL();
            const token = forgotPasswordTokenCreater({ username });
            const confirmationUrl = `${url}/user/forgot-password/${token}`;
            res.render('forgot-password-inform', { url, username });
            mailer(username, 'Password Reset', 'forgot-password-confirmation', {
                confirmationUrl,
                url,
            });
        });
    } catch (error) {
        next(error);
    }
});

// Màn hình nhập mật khẩu mới
router.get('/forgot-password/:token', async (req, res, next) => {
    const { token } = req.params;
    try {
        const info = tokenVerifier(token);
        if (info.type !== 'forgot-password-verify') {
            next();
            return;
        }
        const user = await userController.getByUserName(info.username);
        if (user) {
            res.locals.banner = 'Forgot password';
            res.render('forgot-password-reset', { token });
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Xử lý đổi mật khẩu mới
router.post('/forgot-password/:token', async (req, res, next) => {
    try {
        // Xử lý capcha
        recaptchaV3.verify(req, async (error, data) => {
            // Lấy các giá trị người đùng đã nhập
            const { token } = req.params;

            res.locals.captcha = recaptchaV3.render();
            res.locals.banner = 'Forgot password';

            // Nếu là bot
            if (error || data.score < 0.5) {
                res.locals.message = 'Bot Detected';
                res.locals.type = 'danger';
                res.render('forgot-password-reset', { token });
                return;
            }

            const info = tokenVerifier(token);
            if (info.type !== 'forgot-password-verify') {
                next();
                return;
            }
            const { password, confirmPassword } = req.body;
            const validateResult = passwordSchema.validate({ password, confirmPassword });
            // Kiểm tra người dùng bỏ trống các thông tin không
            if (validateResult.error) {
                // Nếu có bỏ trống thông tin thì
                // hiển thị lại thông tin người dùng đã nhập để tiếp tục nhập tiếp
                res.locals.message = validateResult.error.message;
                res.locals.type = 'danger';
                res.render('forgot-password-reset', { token });
                return;
            }
            const user = await userController.getByUserName(info.username);
            if (user) {
                const updatedUser = await userController.updateUser(user, { password: validateResult.value.password });
                if (updatedUser) {
                    res.locals.user = updatedUser;
                    res.render('forgot-password-success');
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
