export default (sequelize, DataTypes) => {
  return sequelize.define(
    "TrialLesson",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      student_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teacher_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      course_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      room: {
        type: DataTypes.STRING,
        defaultValue: "201-xona",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Kutilyapti",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "trial_lessons",
      timestamps: false,
    },
  );
};
