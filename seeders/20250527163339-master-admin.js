'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('qwertyuiop', 10);

    try {
      await queryInterface.bulkInsert('admins', [{
        name: 'Mohammad Hisham Mir',
        phone: '7889466366',
        email: '23083110013@kashmiruniversity.net',
        address: '123 Admin HQ',
        password_hash: hashedPassword,
        role: 'super_admin',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
      console.log('✅ Master admin inserted successfully.');
    } catch (error) {
      console.error('❌ Seeder error:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', {
      email: '23083110013@kashmiruniversity.net'
    }, {});
  }
};
