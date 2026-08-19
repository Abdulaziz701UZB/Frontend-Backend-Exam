export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Certificate",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      student_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      course_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      qr_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      grade: {
        type: DataTypes.STRING,
        defaultValue: "A+",
      },
    },
    {
      tableName: "certificates",
      timestamps: false,
    },
  );
};
