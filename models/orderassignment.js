module.exports = (sequelize, DataTypes) => {
  const OrderAssignment = sequelize.define('OrderAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('assigned', 'missed', 'picked', 'completed'),
      allowNull: true,
    },
  }, {
    tableName: 'order_assignments',
    timestamps: true, // manages createdAt and updatedAt
    underscored: true,
  });

  OrderAssignment.associate = models => {
    OrderAssignment.belongsTo(models.Order, { foreignKey: 'order_id', onDelete: 'CASCADE' });
    OrderAssignment.belongsTo(models.Rider, { foreignKey: 'rider_id' });
  };

  return OrderAssignment;
};
