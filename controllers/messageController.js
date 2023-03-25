const controller = {};
const models = require('../models');

const { Message } = models;

// Thêm comment
controller.add = (comment) => Message.create(comment);

module.exports = controller;
