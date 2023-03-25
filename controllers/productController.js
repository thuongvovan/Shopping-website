const controller = {};
const { Op } = require('sequelize');
const models = require('../models');

const { Product } = models;

// Lấy tất cả sản phẩm kèm theo bộ filter
controller.getAll = (query) => {
    const option = {
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'imagepath', 'price'],
        include: [models.Category],
        where: {},
    };

    if (query.search && query.search !== '') {
        option.where.name = { [Op.iLike]: `%${query.search}%` };
    }

    if (query.category && !Number.isNaN(query.category)) {
        option.where.categoryId = query.category;
    }

    if (query.brand && !Number.isNaN(query.brand)) {
        option.where.brandId = query.brand;
    }

    if (query.color && !Number.isNaN(query.color)) {
        option.include.push({
            model: models.Color,
            attributes: ['id'],
            where: {
                id: query.color,
            },
        });
    }

    if (query.min && !Number.isNaN(query.min)) {
        option.where.price = { ...option.where.price, [Op.gte]: query.min };
    }

    if (query.max && !Number.isNaN(query.max)) {
        option.where.price = { ...option.where.price, [Op.lte]: query.max };
    }

    if (query.order) {
        switch (query.order) {
            case 'name-desc':
                option.order = [['name', 'DESC']];
                break;
            case 'price-asc':
                option.order = [['price', 'ASC']];
                break;
            case 'price-desc':
                option.order = [['price', 'DESC']];
                break;
            case 'review-asc':
                option.order = [['overallReview', 'ASC']];
                break;
            case 'review-desc':
                option.order = [['overallReview', 'DESC']];
                break;
            default:
                break;
        }
    }

    if (query.limit && !Number.isNaN(query.limit)) {
        option.limit = query.limit;
    } else {
        option.limit = 9;
    }

    if (query.page > 0) {
        option.offset = (query.page - 1) * option.limit;
    } else {
        option.offset = 0;
    }

    return Product.findAndCountAll(option); // trả về thêm {rows, count}
};

// Lấy danh sách sản phẩm xu hướng
// Tạm định nghĩa là review cao nhất
controller.getTrending = () =>
    Product.findAll({
        order: [['overallReview', 'DESC']],
        limit: 8,
        attributes: ['id', 'name', 'imagepath', 'price', 'overallReview'],
        include: models.Category,
    });

// Lấy danh sách sản phẩm top đầu
// Tạm định nghĩa là review cao nhất
controller.getTop = () =>
    Product.findAll({
        order: [['overallReview', 'DESC']],
        limit: 12,
        attributes: ['id', 'name', 'imagepath', 'price'],
    });

// Lấy một sản phẩm và kẻm theo toàn bộ thuộc tính cả sản phầm
// Tên loại sản phẩm
// Danh sách review
// Danh sách thuộc tính
// Danh sách comment
controller.getByIdWithProperty = (id) =>
    new Promise((resolve, reject) => {
        Product.findByPk(id)
            .then(async (p) => {
                const product = p;
                [
                    product.Category,
                    product.Reviews,
                    product.Specifications,
                    product.Comments,
                    product.Brand,
                    product.Colors,
                ] = await Promise.all([
                    p.getCategory({ attributes: ['name'] }),
                    p.getReviews({ include: [{ model: models.User, attributes: ['fullname', 'avatarPath'] }] }),
                    p.getSpecifications(),
                    p.getComments({
                        where: { parentCommentId: null },
                        order: [['createdAt', 'DESC']],
                        include: [
                            {
                                model: models.Comment,
                                as: 'SubComments',
                                order: [['createdAt', 'DESC']],
                                include: { model: models.User },
                            },
                            { model: models.User },
                        ],
                    }),
                    p.getBrand({ attributes: ['name'] }),
                    p.getColors(),
                ]);

                // maping color code and color url
                const colors = product.Colors.map((c) => {
                    const color = c.code || `url(${c.imagepath})`;
                    const { imagepath } = c.ProductColor;
                    return { color, imagepath };
                });

                product.Colors = colors;
                // count rating
                const ratingCount = [];
                for (let i = 1; i <= 5; i += 1) {
                    const reviews = product.Reviews.filter((review) => review.rating === i);
                    const count = reviews.length;
                    ratingCount.push(count);
                }
                product.RatingCount = ratingCount;
                // return product
                resolve(product);
            })
            .catch((err) => {
                reject(new Error(err));
            });
    });
// Lấy một sản phẩm
controller.getById = (id) => Product.findByPk(id);

// Lấy một sản phẩm kèm theo các review
controller.getByIdWithReview = (id) =>
    Product.findByPk(id, {
        include: models.Review,
    });

// Cập nhật sản phẩm
controller.update = (product) => product.save();

module.exports = controller;
