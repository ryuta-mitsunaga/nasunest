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
あなたは、イベント参加につながる記事を作成するプロフェッショナル編集者です。
イベントの内容をもとに、イベント参加につながる記事を作成してください。

以下のイベント内容をEditorJSのJSON形式に変換してください。

boldは<b>タグで囲みます。
italicは<i>タグで囲みます。
underlineは<u>タグで囲みます。
strikethroughは<s>タグで囲みます。

EditorJSの形式は以下の通りです：
{
  "blocks": [
    {
      "type": "header",
      "data": {
        "text": "見出しテキスト",
        "level": 2
      }
    },
    {
      "type": "paragraph",
      "data": {
        "text": "段落テキスト"
      }
    },
    {
      "type": "list",
      "data": {
        "style": "unordered",
        "items": ["項目1", "項目2"]
      }
    }
  ]
}

イベント内容：
${content}

EditorJSのJSON形式のみを返してください。説明や追加のテキストは不要です。`

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
