'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 既存のプロンプトからEditorJS形式の説明を削除
    const editorJsFormatPattern = /\n\n【EditorJS形式】[\s\S]*?イベント内容：\n{{content}}$/
    
    // マスタープロンプトを更新
    const masterPrompts = await queryInterface.sequelize.query(
      'SELECT id, prompt FROM editorjs_prompts_master',
      { type: Sequelize.QueryTypes.SELECT }
    )
    
    for (const prompt of masterPrompts) {
      const cleanedPrompt = prompt.prompt.replace(editorJsFormatPattern, '\n\nイベント内容：\n{{content}}')
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
      const cleanedPrompt = prompt.prompt.replace(editorJsFormatPattern, '\n\nイベント内容：\n{{content}}')
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
    // ロールバック時はEditorJS形式を再度追加
    const editorJsFormat = `

【EditorJS形式】
{
  "blocks": [
    { "type": "header", "data": { "text": "", "level": 2 }},
    { "type": "paragraph", "data": { "text": "" }},
    { "type": "list", "data": { "style": "unordered", "items": [] }}
  ]
}

【必須ルール】
・EditorJS の JSON のみ返してください。
・説明文や補足は不要です。
・bold は<b>タグ、italic は<i>タグ、underline は<u>タグ、取り消し線は<s>タグを使用してください。
・構成と文章は読みやすく簡潔に。
・SNSシェアや参加意欲が高まりやすい文章を意識すること。`
    
    // マスタープロンプトを更新
    const masterPrompts = await queryInterface.sequelize.query(
      'SELECT id, prompt FROM editorjs_prompts_master',
      { type: Sequelize.QueryTypes.SELECT }
    )
    
    for (const prompt of masterPrompts) {
      const updatedPrompt = prompt.prompt.replace(
        /\n\nイベント内容：\n{{content}}$/,
        editorJsFormat + '\n\nイベント内容：\n{{content}}'
      )
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
      const updatedPrompt = prompt.prompt.replace(
        /\n\nイベント内容：\n{{content}}$/,
        editorJsFormat + '\n\nイベント内容：\n{{content}}'
      )
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
