const controller = {};
const { Op } = require('sequelize');
const models = require('../models');

const { Category } = models;

// Lấy toàn bộ loại sản phầm
controller.getAll = () =>
    Category.findAll({
        attributes: ['id', 'name', 'imagepath', 'summary'],
    });

// Lấy loại sản phẩm và đếm số lượng sản phẩm của mỗi loại sau filter
controller.countProduct = (query) => {
    const option = {
        attributes: ['id', 'name'],
        include: [
            {
                model: models.Product,
                col: ['id'],
                where: {},
            },
        ],
        group: ['Category.id'],
    };

    if (query.search && query.search !== '') {
        option.include[0].where.name = { [Op.iLike]: `%${query.search}%` };
    }

    return Category.count(option);
};

module.exports = controller;
