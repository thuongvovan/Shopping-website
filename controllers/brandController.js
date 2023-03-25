const controller = {};
const { Op } = require('sequelize');
const models = require('../models');

const { Brand } = models;

// Lấy toàn bộ thương hiệu
controller.getAll = () =>
    Brand.findAll({
        attributes: ['id', 'name', 'imagepath', 'summary'],
    });

// Lấy thương hiệu và số lượng sản phẩm sau khi filter
controller.countProduct = (query) => {
    const option = {
        attributes: ['id', 'name'],
        include: [
            {
                model: models.Product,
                col: ['id'],
                where: {},
                include: [],
            },
        ],
        group: ['Brand.id'],
    };

    if (query.category && !Number.isNaN(query.category)) {
        option.include[0].where.categoryId = query.category;
    }

    if (query.color && !Number.isNaN(query.color)) {
        option.include[0].include.push({
            model: models.Color,
            where: { id: query.color },
        });
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

    return Brand.count(option);
};

module.exports = controller;
