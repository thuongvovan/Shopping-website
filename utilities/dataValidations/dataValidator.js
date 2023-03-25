// eslint-disable-next-line import/no-extraneous-dependencies
const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .required(),
    confirmPassword: Joi.required()
        .valid(Joi.ref('password'))
        .error(new Error('The password confirmation does not match')),
    fullname: Joi.string().required(),
    avatarPath: Joi.string().uri({ allowRelative: true }),
    isAdmin: Joi.boolean().default(false),
});

const passwordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .required(),
    confirmPassword: Joi.required()
        .valid(Joi.ref('password'))
        .error(new Error('The password confirmation does not match')),
});

function userNormalizer(user) {
    return user.trim();
}

const messageSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
});

module.exports = { userSchema, userNormalizer, passwordSchema, messageSchema };
