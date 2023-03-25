const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

const routers = {};
// export toàn bộ route vào trong một object
fs.readdirSync(__dirname)
    .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
    .forEach((file) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const router = require(path.join(__dirname, file));

        const routerName = file.slice(0, -3);
        routers[routerName] = router;
    });

module.exports = routers;
