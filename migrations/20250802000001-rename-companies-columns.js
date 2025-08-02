'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the old column exists before renaming
    const tableDescription = await queryInterface.describeTable('Companies');
    
    if (tableDescription.total_range_in_meters) {
      await queryInterface.renameColumn('Companies', 'total_range_in_meters', 'register_range_meters');
    }
    
    // Remove working_hours_per_day if it exists (this field is not in the model)
    if (tableDescription.working_hours_per_day) {
      await queryInterface.removeColumn('Companies', 'working_hours_per_day');
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverse the changes
    const tableDescription = await queryInterface.describeTable('Companies');
    
    if (tableDescription.register_range_meters) {
      await queryInterface.renameColumn('Companies', 'register_range_meters', 'total_range_in_meters');
    }
    
    // Add back working_hours_per_day if it was removed
    if (!tableDescription.working_hours_per_day) {
      await queryInterface.addColumn('Companies', 'working_hours_per_day', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  }
};
