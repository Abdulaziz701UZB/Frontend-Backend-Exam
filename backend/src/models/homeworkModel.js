export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Homework",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      group_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_submitted: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Active",
      },
    },
    {
      tableName: "homework",
      timestamps: false,
    },
  );
};
