const controller = {};
const bcrypt = require('bcryptjs');
const models = require('../models/index');

const { User } = models;

// Lấy user chưa xác thực theo username/email
controller.getAllByUserName = (username) =>
    User.findOne({
        where: { username },
    });

// Lấy user đã xác thực theo username/email
controller.getByUserName = (username) =>
    User.findOne({
        where: { username, isVerified: true },
    });

controller.setVerifiedUser = async (username) => {
    const user = await controller.getAllByUserName(username);
    user.isVerified = true;
    return user.save();
};

// Tạo user
controller.createUser = (user) => {
    const newUser = user;
    newUser.password = bcrypt.hashSync(user.password, 10);
    newUser.isAdmin = false;
    return User.create(user);
};

// Tạo user
controller.updateUser = (currentUser, newInfos) => {
    const updatedInfo = Object.keys(newInfos);
    for (let i = 0; i < updatedInfo.length; i += 1) {
        const info = updatedInfo[i];
        if (info === 'password') {
            currentUser[info] = bcrypt.hashSync(newInfos[info], 10);
        } else {
            currentUser[info] = newInfos[info];
        }
    }
    return currentUser.save();
};

// Xác thực user
controller.authentication = async (userInput) => {
    const user = await User.findOne({ where: { username: userInput.username, isVerified: true } });
    if (user) {
        const isMatched = bcrypt.compareSync(userInput.password, user.password);
        if (isMatched) {
            return { result: isMatched, user };
        }
        return { result: isMatched, type: 'danger', message: 'Incorrect password!' };
    }
    return { result: false, type: 'danger', message: 'User name dose not exists!' };
};

// Middleware kiểm tra người dùng đã đăng nhập hay chưa
controller.isLoggedInContinuous = (req, res, next) => {
    // Nếu đã login thì đi tiếp trang cần thực thi
    if (req.session.user) {
        next();
        return;
    }
    // Nếu chưa thì trả về login kèm param là url đang dứng để sau khi đăng nhập có thể quay về trang cũ
    res.redirect(`/user/login?returnUrl=${req.originalUrl}`);
};

// Middleware kiểm tra người dùng đã đăng nhập hay chưa
controller.isLoggedIn = (req, res, next) => {
    // Nếu đã login thì đi tiếp trang cần thực thi
    if (req.session.user) {
        next();
        return;
    }
    // Nếu chưa thì trả về login kèm param là url đang dứng để sau khi đăng nhập có thể quay về trang cũ
    res.redirect(`/`);
};

// Middleware kiểm tra người dùng đã đăng nhập hay chưa
// Nhưng xử lý ngược lại để chống đã login lại vào trang login tiếp
controller.isLoggedInReverse = (req, res, next) => {
    // Nếu đã login thì trả về trang hiện tại
    if (req.session.user) {
        res.redirect(`/`);
        return;
    }
    // Nếu chưa thì đi tiếp
    next();
};

module.exports = controller;
