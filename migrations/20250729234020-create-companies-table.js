'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      _id: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
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
      allow_entry_out_range: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      start_time_morning: {
        type: Sequelize.TIME,
        allowNull: true
      },
      end_time_morning: {
        type: Sequelize.TIME,
        allowNull: true
      },
      start_time_afternoon: {
        type: Sequelize.TIME,
        allowNull: true
      },
      end_time_afternoon: {
        type: Sequelize.TIME,
        allowNull: true
      },
      working_hours_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      total_range_in_meters: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.dropTable('Companies');
  }
};
