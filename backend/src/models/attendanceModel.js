export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Attendance",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      group_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Present",
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reason_category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "attendance",
      timestamps: false,
    },
  );
};
