const db = require('./models/index');

// Khỏi tạo cấu trúc db
db.sequelize
    .sync({ force: true })
    .then(() => {
        console.log('Database sync complete!');
        process.exit();
    })
    .catch((err) => {
        console.log('Database creating get something wrong!');
        console.error(err);
    });

// sequelize db:seed:all
