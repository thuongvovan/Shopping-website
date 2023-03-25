const paginate = require('express-handlebars-paginate');
const helpers = require('handlebars-helpers');

const math = helpers.math();
const comparison = helpers.comparison();

module.exports = {
    times(n, block) {
        let accum = '';
        for (let i = 0; i < n; i += 1) accum += block.fn(i);
        return accum;
    },

    isShowBanner(banner) {
        return banner !== 'Home';
    },

    createStar(star) {
        const starActive = `<i class="fa fa-star"></i>`;
        const starDisable = `<i class="fa fa-star star-disable"></i>`;
        let string = '';
        for (let i = 0; i < star; i += 1) {
            string += starActive;
        }

        for (let i = 0; i < 5 - star; i += 1) {
            string += starDisable;
        }

        return string;
    },

    indexer(arr, index) {
        return arr[index];
    },

    toUTC(dateTime) {
        return dateTime.toUTCString();
    },

    minus: math.minus,

    is: comparison.is,

    lt: comparison.lt,

    createPagination: paginate.createPagination,
};
