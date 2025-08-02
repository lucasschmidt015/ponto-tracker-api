'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if the user role already exists
    const existingUserRole = await queryInterface.rawSelect('UserRoles', {
      where: { _id: '3fa45f67-1e79-4aac-bd36-33f7a8e4c9a1' },
    }, ['_id']);

    // Only insert if it doesn't exist
    if (!existingUserRole) {
      await queryInterface.bulkInsert('UserRoles', [{
        _id: '3fa45f67-1e79-4aac-bd36-33f7a8e4c9a1',
        user_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        role_id: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      console.log('✅ Default user role created');
    } else {
      console.log('ℹ️  Default user role already exists, skipping...');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserRoles', {
      _id: '3fa45f67-1e79-4aac-bd36-33f7a8e4c9a1'
    }, {});
  }
};
