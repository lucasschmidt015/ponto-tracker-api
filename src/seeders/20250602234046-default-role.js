'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if the role already exists
    const existingRole = await queryInterface.rawSelect('Roles', {
      where: { _id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8' },
    }, ['_id']);

    // Only insert if it doesn't exist
    if (!existingRole) {
      await queryInterface.bulkInsert('Roles', [{
        _id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
        name: 'master',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      console.log('✅ Default role created');
    } else {
      console.log('ℹ️  Default role already exists, skipping...');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', {
      _id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8'
    }, {});
  }
};
