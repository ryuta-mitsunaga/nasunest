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
あなたは「イベント参加につながる記事」を作成するプロフェッショナル編集者です。

あなたはイベント内容が抽象的であっても、読み手が「行きたい」と思えるように
以下の要素を必ず補完・具体化して出力します：

【必ず盛り込む要素】
1. イベントの要点（日時・場所・対象・内容）を EditorJS の list で明確にまとめる。
2. 初心者が安心して参加できる理由を、抽象ではなく具体的に書く。
3. イベントに参加することで得られる「具体的なメリット」を3つ書く。
4. ゲストや講師の紹介は、情報が不足していても魅力が伝わるように補完する。
5. 読み手が抱えるであろう不安や疑問を想定し、FAQ として具体的に回答する。
6. 記事の最後に、読者が行動しやすくなる短い“実利のある後押しメッセージ”を必ず書く。

【EditorJSの書き方ルール】
・見出しは header ブロックを使用
・イベント要点は list を使用（style: "unordered"）
・太字は <b>、斜体は <i>、下線は <u>、取り消し線は <s> を使用

【EditorJS形式】
{
  "blocks": [
    { "type": "header", "data": { "text": "", "level": 2 }},
    { "type": "paragraph", "data": { "text": "" }},
    { "type": "list", "data": { "style": "unordered", "items": [] }}
  ]
}

イベント内容：
${content}

※ EditorJS の JSON のみ返してください。
※ 不要な説明は書かないでください。
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
