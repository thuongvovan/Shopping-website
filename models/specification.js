module.exports = (sequelize, DataTypes) => {
    const Specification = sequelize.define(
        'Specification',
        {
            name: DataTypes.STRING,
            summary: DataTypes.TEXT,
        },
        {},
    );
    Specification.associate = (models) => {
        // associations can be defined here
        Specification.hasMany(models.ProductSpecification, { foreignKey: 'specificationId' });
        Specification.belongsToMany(models.Product, {
            through: models.ProductSpecification,
            foreignKey: 'specificationId',
        });
    };
    return Specification;
};
