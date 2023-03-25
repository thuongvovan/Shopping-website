const controller = {};
const models = require('../models');

const { Comment } = models;

// Thêm comment
controller.add = (comment) => Comment.create(comment);

module.exports = controller;
