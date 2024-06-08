module.exports = (sequelize, DataTypes) => {

    const Contact = sequelize.define("contact", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          linkedId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          linkPrecedence: {
            type: DataTypes.ENUM('primary', 'secondary'),
            allowNull: false,
            defaultValue: 'primary',
          },
          createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
          },
          updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
          },
          deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
          }
    })

    return Contact

}