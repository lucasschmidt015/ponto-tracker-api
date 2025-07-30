'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Entries', {
      _id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false
      },
      entry_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      },
      latitude: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      longitude: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      working_day_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
        references: {
          model: 'WorkingDays',
          key: '_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
        references: {
          model: 'Users',
          key: '_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Entries');
  }
};
