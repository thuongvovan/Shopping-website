// eslint-disable-next-line import/no-extraneous-dependencies
const Recaptcha = require('express-recaptcha');

const { RecaptchaV3 } = Recaptcha;

const RECAPTCHA_SITE_KEY_V3 = '6LdzpnUkAAAAACq3OZdqppiqFlNk93oSeKgddIrO';
const RECAPTCHA_SECRET_KEY_V3 = '6LdzpnUkAAAAAINkAy2cYdfHrAOiLcWIMZnOan7y';

const recaptchaV3 = new RecaptchaV3(RECAPTCHA_SITE_KEY_V3, RECAPTCHA_SECRET_KEY_V3, { callback: 'cb' });

module.exports = recaptchaV3;
