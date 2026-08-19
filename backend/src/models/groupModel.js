export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Group",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      course_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      teacher_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      room: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      schedule_days: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      schedule_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      monthly_fee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Active",
      },
      start_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "groups",
      timestamps: false,
    },
  );
};
