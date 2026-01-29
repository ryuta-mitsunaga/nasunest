import {
  requireAdminId,
} from '~~/server/lib/admin-auth'
import {
  EditorJsPromptMaster,
  EditorJsPromptCustom,
} from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    const body = await readBody(event)
    const { content, promptId, promptType } = body

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

    // プロンプトを取得
    let promptTemplate = ''
    if (promptId && promptType) {
      if (promptType === 'master') {
        const masterPrompt = await EditorJsPromptMaster.findByPk(promptId)
        if (!masterPrompt) {
          throw createError({
            statusCode: 404,
            message: 'プロンプトが見つかりません',
          })
        }
        promptTemplate = masterPrompt.prompt
      } else if (promptType === 'custom') {
        const customPrompt = await EditorJsPromptCustom.findOne({
          where: {
            id: promptId,
            admin_id: adminId,
          },
        })
        if (!customPrompt) {
          throw createError({
            statusCode: 404,
            message: 'プロンプトが見つかりません',
          })
        }
        promptTemplate = customPrompt.prompt
      }
    }

    // プロンプトが指定されていない場合はデフォルトを使用
    if (!promptTemplate) {
      const defaultPrompt = await EditorJsPromptMaster.findOne({
        order: [['display_order', 'ASC']],
      })
      if (!defaultPrompt) {
        throw createError({
          statusCode: 404,
          message: 'デフォルトプロンプトが見つかりません',
        })
      }
      promptTemplate = defaultPrompt.prompt
    }

    // 固定のEditorJS形式説明とイベント内容を定義
    // これらは必ず末尾に追加される（どのプロンプトにも適用）
    const editorJsFormatInstruction = `

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
${content}`

    // プロンプトテンプレートに固定のEditorJS形式説明とイベント内容を追加
    // プロンプトテンプレート内の{{content}}は削除（既にAPI側で追加されるため）
    const cleanedTemplate = promptTemplate.replace(/\n*イベント内容：\s*\n*{{content}}\s*/g, '').trim()
    const prompt = cleanedTemplate + editorJsFormatInstruction

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
