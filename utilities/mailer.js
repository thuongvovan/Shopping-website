// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');
// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailerHbs = require('nodemailer-express-handlebars');
require('dotenv').config();

// Thông tin kết nối
const { MAIL_USER, MAIL_PASSWORD, DOMAIN } = process.env;
const connectInfo = {
    host: 'outlook.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
    },
};

// Thông tin cấu hình hbs render email
const hbsCompiler = nodemailerHbs({
    viewEngine: {
        extName: '.hbs',
        partialsDir: 'templates/partials',
        layoutsDir: 'templates/layouts',
        defaultLayout: 'layout.hbs',
    },
    viewPath: 'templates/',
    extName: '.hbs',
});

async function sendMail(to, subject, template, context) {
    // Khởi tạo một transporter sử dụng SMTP của Outlook
    const transporter = nodemailer.createTransport(connectInfo);
    transporter.use('compile', hbsCompiler);
    const formalSubject = `[${DOMAIN}] - ${subject}`;
    const mailOptions = { from: MAIL_USER, to, subject: formalSubject, template, context };
    await transporter.sendMail(mailOptions);
    transporter.close();
}

module.exports = sendMail;

// console.log(MAIL_USER);
// console.log(MAIL_PASSWORD);
// const mailTo = 'vovanthuong1993@gmail.com';
// sendMail(mailTo, 'Gưi mail test', 'register-confirmation', {
//     fullname: 'vvThuong',
//     domain: 'thuongvv',
//     confirmationUrl: '...',
// });

// module.exports = sendMail;

// Mẫu gửi email
// sendMail(
//   "vovanthuong1993@gmail.com",
//   "Test email from Outlook lần 2",
//   "register-confirmation",
//   {
//     fullname: "Võ Văn Thương",
//     username: "vovanthuong@outlook.com.vn",
//     confirmationUrl: "https://thuongvv.ddns.net"
//   }
// );
