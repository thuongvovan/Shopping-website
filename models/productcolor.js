module.exports = (sequelize, DataTypes) => {
    const ProductColor = sequelize.define(
        'ProductColor',
        {
            // id: {
            //     type: DataTypes.INTEGER,
            //     primaryKey: true,
            //     autoIncrement: true,
            //     allowNull: false
            //   },
            imagepath: DataTypes.TEXT,
        },
        {},
    );

    // ProductColor.associate = (models) => {
    // associations can be defined here
    // ProductColor.belongsTo(models.Color, { foreignKey: 'colorId' }); // supper N-N
    // ProductColor.belongsTo(models.Product, { foreignKey: 'productId' }); // supper N-N
    // };

    return ProductColor;
};
