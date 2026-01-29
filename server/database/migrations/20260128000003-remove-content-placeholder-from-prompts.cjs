'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 既存のプロンプトから「イベント内容：\n{{content}}」を削除
    const contentPlaceholderPattern = /\n*イベント内容：\s*\n*{{content}}\s*/g
    
    // マスタープロンプトを更新
    const masterPrompts = await queryInterface.sequelize.query(
      'SELECT id, prompt FROM editorjs_prompts_master',
      { type: Sequelize.QueryTypes.SELECT }
    )
    
    for (const prompt of masterPrompts) {
      const cleanedPrompt = prompt.prompt.replace(contentPlaceholderPattern, '').trim()
      await queryInterface.sequelize.query(
        'UPDATE editorjs_prompts_master SET prompt = :prompt WHERE id = :id',
        {
          replacements: { prompt: cleanedPrompt, id: prompt.id },
          type: Sequelize.QueryTypes.UPDATE,
        }
      )
    }
    
    // カスタムプロンプトを更新
    const customPrompts = await queryInterface.sequelize.query(
      'SELECT id, prompt FROM editorjs_prompts_custom',
      { type: Sequelize.QueryTypes.SELECT }
    )
    
    for (const prompt of customPrompts) {
      const cleanedPrompt = prompt.prompt.replace(contentPlaceholderPattern, '').trim()
      await queryInterface.sequelize.query(
        'UPDATE editorjs_prompts_custom SET prompt = :prompt WHERE id = :id',
        {
          replacements: { prompt: cleanedPrompt, id: prompt.id },
          type: Sequelize.QueryTypes.UPDATE,
        }
      )
    }
  },

  async down(queryInterface, Sequelize) {
    // ロールバック時は「イベント内容：\n{{content}}」を再度追加
    const contentPlaceholder = '\n\nイベント内容：\n{{content}}'
    
    // マスタープロンプトを更新
    const masterPrompts = await queryInterface.sequelize.query(
      'SELECT id, prompt FROM editorjs_prompts_master',
      { type: Sequelize.QueryTypes.SELECT }
    )
    
    for (const prompt of masterPrompts) {
      const updatedPrompt = prompt.prompt + contentPlaceholder
      await queryInterface.sequelize.query(
        'UPDATE editorjs_prompts_master SET prompt = :prompt WHERE id = :id',
        {
          replacements: { prompt: updatedPrompt, id: prompt.id },
          type: Sequelize.QueryTypes.UPDATE,
        }
      )
    }
    
    // カスタムプロンプトを更新
    const customPrompts = await queryInterface.sequelize.query(
      'SELECT id, prompt FROM editorjs_prompts_custom',
      { type: Sequelize.QueryTypes.SELECT }
    )
    
    for (const prompt of customPrompts) {
      const updatedPrompt = prompt.prompt + contentPlaceholder
      await queryInterface.sequelize.query(
        'UPDATE editorjs_prompts_custom SET prompt = :prompt WHERE id = :id',
        {
          replacements: { prompt: updatedPrompt, id: prompt.id },
          type: Sequelize.QueryTypes.UPDATE,
        }
      )
    }
  },
}
