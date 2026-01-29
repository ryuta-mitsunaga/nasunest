'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 現在のプロンプトをデフォルトとして挿入
    // EditorJS形式、必須ルール、「イベント内容：\n{{content}}」はAPI側で自動的に追加されるため、ここには含めない
    const defaultPrompt = `あなたは、イベント参加につながる読みやすい記事を作成するプロフェッショナル編集者です。

【イベント記事のルール】  
以下のUXルールを必ず守り、読みやすい構成にしてください。

- 1つの段落は長く書かず、最大3〜4行以内で簡潔にまとめる  
- 長文を避け、情報は「短い段落」か「箇条書き」で整理する  
- セクション間にメリハリを付け、読み疲れを起こさない  
- 抽象表現は避け、イベント内容を具体的に書く  
- 初心者向け安心ポイントは、1段落＋箇条書きで簡潔に  
- メリットは1つずつ短く明確に（長文禁止）  
- ゲスト紹介はコンパクトにしつつ魅力が伝わるように  
- 全体で読みやすい長さ（一般的なイベント告知レベル）に収める  

【記事に必ず入れる要素】  
1. イベント要点（listで簡潔に）  
2. イベントの簡単な紹介（短い段落）  
3. 初心者安心ポイント（簡潔）  
4. 参加メリット3つ（短く）  
5. ゲスト紹介（短く魅力的に）  
6. FAQ（必要最低限でOK）  
7. 最後の後押し（短い一言）`

    await queryInterface.bulkInsert('editorjs_prompts_master', [
      {
        name: '標準プロンプト',
        prompt: defaultPrompt,
        display_order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('editorjs_prompts_master', {
      name: '標準プロンプト',
    })
  },
}
