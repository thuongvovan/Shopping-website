// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('private.key').toString();

function registerTokenCreater(data) {
    data.type = 'register-verify';
    const token = jwt.sign(data, privateKey, { expiresIn: '24h' });
    return token;
}

function forgotPasswordTokenCreater(data) {
    data.type = 'forgot-password-verify';
    const token = jwt.sign(data, privateKey, { expiresIn: '30m' });
    return token;
}

function tokenVerifier(token) {
    const decoded = jwt.verify(token, privateKey);
    return decoded;
}

module.exports = { registerTokenCreater, tokenVerifier, forgotPasswordTokenCreater };
