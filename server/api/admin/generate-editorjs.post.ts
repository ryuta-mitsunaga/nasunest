import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const body = await readBody(event)
    const { content } = body

    if (!content || typeof content !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'イベント内容が必要です',
      })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'APIキーが設定されていません',
      })
    }

    // Gemini APIを呼び出し
    const prompt = `
あなたは、イベント参加につながる読みやすい記事を作成するプロフェッショナル編集者です。

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
7. 最後の後押し（短い一言）

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
・SNSシェアや参加意欲が高まりやすい文章を意識すること。

イベント内容：
${content}
`

    const response = (await $fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
      }
    )) as any

    // レスポンスからテキストを抽出
    const generatedText =
      response.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!generatedText) {
      throw createError({
        statusCode: 500,
        message: 'JSONの生成に失敗しました',
      })
    }

    // JSONを抽出（コードブロックやマークダウン記号を除去）
    let jsonText = generatedText.trim()
    // コードブロックを除去
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    // 先頭と末尾の空白や改行を除去
    jsonText = jsonText.trim()

    // JSONをパースして検証
    let parsedJson
    try {
      parsedJson = JSON.parse(jsonText)
    } catch (e) {
      // JSONの抽出を試みる（中括弧で囲まれた部分を探す）
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSONのパースに失敗しました')
      }
    }

    // EditorJSの形式を検証
    if (!parsedJson.blocks || !Array.isArray(parsedJson.blocks)) {
      throw new Error('無効なEditorJS形式です')
    }

    return {
      success: true,
      data: parsedJson,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Gemini API エラー:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'JSONの生成に失敗しました',
    })
  }
})
