const controller = {};
const models = require('../models/index');

const { Review } = models;

// Thêm review
controller.add = async (reviewData) => {
    const review = await Review.findOne({
        where: {
            productId: reviewData.productId,
            userId: reviewData.userId,
        },
    });

    if (review) {
        review.rating = reviewData.rating;
        review.message = reviewData.message;
        return review.save();
    }
    return Review.create(reviewData);
};

module.exports = controller;
