export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Student",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parent_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      group_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      group_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      join_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      payment_status: {
        type: DataTypes.STRING,
        defaultValue: "Paid",
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Active",
      },
    },
    {
      tableName: "students",
      timestamps: false,
      indexes: [
        { fields: ["phone"] },
        { fields: ["group_id"] },
        { fields: ["status"] },
        { fields: ["payment_status"] },
      ],
    },
  );
};
