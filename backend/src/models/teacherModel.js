export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Teacher",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salary: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      experience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "👨‍🏫",
      },
    },
    {
      tableName: "teachers",
      timestamps: false,
    },
  );
};
