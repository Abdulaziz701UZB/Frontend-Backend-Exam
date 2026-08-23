export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      student_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teacher_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      group_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10,
        },
      },
      category: {
        type: DataTypes.STRING,
        defaultValue: "O'qitish sifati",
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Yangi",
      },
      date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "reviews",
      timestamps: false,
    },
  );
};
