const controller = {};
const { Op } = require('sequelize');
const models = require('../models');

const { Color } = models;

// Lấy tất cả màu sắc của sản phẩm
controller.getAll = () =>
    Color.findAll({
        attributes: ['id', 'name', 'imagepath', 'code'],
    });

// Lấy màu sắc và đếm số lượng sản phẩm của mỗi màu sau khi filter
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
        group: ['Color.id'],
    };

    if (query.category && !Number.isNaN(query.category)) {
        option.include[0].where.categoryId = query.category;
    }

    if (query.brand && !Number.isNaN(query.brand)) {
        option.include[0].where.brandId = query.brand;
    }

    if (query.min && !Number.isNaN(query.min)) {
        option.include[0].where.price = { ...option.include[0].where.price, [Op.gte]: query.min };
    }

    if (query.max && !Number.isNaN(query.max)) {
        option.include[0].where.price = { ...option.include[0].where.price, [Op.lte]: query.max };
    }

    if (query.search && query.search !== '') {
        option.include[0].where.name = { [Op.iLike]: `%${query.search}%` };
    }

    return Color.count(option);
};

module.exports = controller;
