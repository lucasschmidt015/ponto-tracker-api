'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [{
      _id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Lucas Schmidt',
      email: 'lucas.schmidt015@gmail.com',
      birthday_date: new Date('1990-01-01'),
      password: '$2b$10$b0ucv3a6bS/yCkMB/6LzuOHBSNqeIBwVGThWoQ1xKxtnX.GPMmzi2',
      company_id: '1b4e28ba-2fa1-11d2-883f-0016d3cca427',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      _id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    }, {});
  }
};
