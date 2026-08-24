export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.STRING,
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
      group_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      month: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      recorded_by: {
        type: DataTypes.STRING,
        defaultValue: "Admin",
      },
    },
    {
      tableName: "payments",
      timestamps: false,
      indexes: [
        { fields: ["student_id"] },
        { fields: ["date"] },
        { fields: ["payment_method"] },
        { fields: ["month"] },
      ],
    },
  );
};
