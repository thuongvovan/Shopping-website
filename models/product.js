module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define(
        'Product',
        {
            name: DataTypes.STRING,
            price: DataTypes.DECIMAL,
            summary: DataTypes.TEXT,
            description: DataTypes.TEXT,
            availability: DataTypes.BOOLEAN,
            imagepath: DataTypes.TEXT,
            thumbnailPath: DataTypes.TEXT,
            overallReview: DataTypes.DOUBLE,
            reviewCount: DataTypes.INTEGER,
        },
        {},
    );
    Product.associate = (models) => {
        // associations can be defined here
        Product.belongsTo(models.Brand, { foreignKey: 'brandId' });
        Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
        // Product.hasMany(models.ProductColor, { foreignKey: 'productId' }); // supper N-N
        Product.belongsToMany(models.Color, {
            through: { model: models.ProductColor },
            foreignKey: 'productId',
            unique: true,
        }); // unique: false -> supper N-N
        Product.hasMany(models.Comment, { foreignKey: 'productId' });
        Product.hasMany(models.ProductSpecification, { foreignKey: 'productId' });
        Product.belongsToMany(models.Specification, { through: models.ProductSpecification, foreignKey: 'productId' });
        Product.hasMany(models.Review, { foreignKey: 'productId' });
    };
    return Product;
};
