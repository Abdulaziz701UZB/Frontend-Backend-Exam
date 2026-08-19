export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Exam",
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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_score: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      max_passing_score: {
        type: DataTypes.INTEGER,
        defaultValue: 70,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Upcoming",
      },
    },
    {
      tableName: "exams",
      timestamps: false,
    },
  );
};
