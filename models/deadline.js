module.exports = (sequelize, DataTypes) => {
  const Deadline = sequelize.define('Deadline', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',  // table name
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    deadline_type: {
      type: DataTypes.ENUM('pickup', 'delivery'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'met', 'missed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    deadline_expire_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fulfilled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'deadlines',
    timestamps: true, 
    underscored: true,
  });

  Deadline.associate = models => {
    Deadline.belongsTo(models.Order, { foreignKey: 'order_id', onDelete: 'CASCADE' });
  };

  return Deadline;
};
