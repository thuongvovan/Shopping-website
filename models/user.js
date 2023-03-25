module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fullname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            avatarPath: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {},
    );
    User.associate = (models) => {
        // associations can be defined here
        User.hasMany(models.Comment, { foreignKey: 'userId' });
        User.hasMany(models.Review, { foreignKey: 'userId' });
        User.hasMany(models.Message, { foreignKey: 'userId' });
    };
    return User;
};
