'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [{
      _id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
      name: 'master',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', {
      _id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
    }, {});
  }
};
