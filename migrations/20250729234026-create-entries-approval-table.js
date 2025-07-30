'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EntriesApprovals', {
      _id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false
      },
      justificative: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approval_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approval_user_id: {
        type: Sequelize.STRING(36),
        allowNull: true,
        references: {
          model: 'Users',
          key: '_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      entry_id: {
        type: Sequelize.STRING(36),
        allowNull: true,
        references: {
          model: 'Entries',
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
    await queryInterface.dropTable('EntriesApprovals');
  }
};
