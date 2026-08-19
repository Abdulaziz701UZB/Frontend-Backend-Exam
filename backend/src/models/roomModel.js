export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      computers_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      projector: {
        type: DataTypes.STRING,
        defaultValue: "Mavjud",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Active",
      },
    },
    {
      tableName: "rooms",
      timestamps: false,
    },
  );
};
