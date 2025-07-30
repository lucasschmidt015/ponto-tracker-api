'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
        register_range_meters: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Companies', { _id: '1b4e28ba-2fa1-11d2-883f-0016d3cca427' }, {});
  }
};
