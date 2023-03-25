module.exports = (sequelize, DataTypes) => {
    const Color = sequelize.define(
        'Color',
        {
            name: DataTypes.STRING,
            imagepath: DataTypes.TEXT,
            code: DataTypes.STRING,
        },
        {},
    );
    Color.associate = (models) => {
        // associations can be defined here
        // Color.hasMany(models.ProductColor, { foreignKey: 'colorId' }); // supper N-N
        Color.belongsToMany(models.Product, {
            through: { model: models.ProductColor },
            foreignKey: 'colorId',
            unique: true,
        }); // unique: false -> // supper N-N
    };
    return Color;
};
