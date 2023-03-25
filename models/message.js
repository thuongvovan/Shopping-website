module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define(
        'Message',
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            subject: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {},
    );
    Message.associate = (models) => {
        // associations can be defined here
        Message.belongsTo(models.User, { foreignKey: 'userId' });
    };
    return Message;
};
