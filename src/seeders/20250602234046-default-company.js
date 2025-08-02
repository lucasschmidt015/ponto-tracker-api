'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if the company already exists
    const existingCompany = await queryInterface.rawSelect('Companies', {
      where: { _id: '1b4e28ba-2fa1-11d2-883f-0016d3cca427' },
    }, ['_id']);

    // Only insert if it doesn't exist
    if (!existingCompany) {
      await queryInterface.bulkInsert('Companies', [
        {
          _id: '1b4e28ba-2fa1-11d2-883f-0016d3cca427',
          name: 'Schmidt Corporation',
          email: 'lucas.schmidt015@gmail.com',
          latitude: '-23.550520',
          longitude: '-46.633308',
          allow_entry_out_range: true,
          start_time_morning: '08:00:00',
          end_time_morning: '12:00:00',
          start_time_afternoon: '13:00:00',
          end_time_afternoon: '17:00:00',
          working_hours_per_day: 8,
          total_range_in_meters: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ], {});
      console.log('✅ Default company created');
    } else {
      console.log('ℹ️  Default company already exists, skipping...');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Companies', { _id: '1b4e28ba-2fa1-11d2-883f-0016d3cca427' }, {});
  }
};
