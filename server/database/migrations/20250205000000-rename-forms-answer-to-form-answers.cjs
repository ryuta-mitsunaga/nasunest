'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('forms_answer', 'form_answers')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('form_answers', 'forms_answer')
  },
}

