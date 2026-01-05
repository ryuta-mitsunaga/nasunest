import { EventReportComment, EventReport } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { token, email, name, age, sex, area, comment } = body

    // トークンの検証
    if (!token) {
      throw createError({
        statusCode: 400,
        message: 'トークンが指定されていません',
      })
    }

    const eventReport = await EventReport.findOne({
      where: {
        id,
        comment_token: token,
      },
    })

    if (!eventReport) {
      throw createError({
        statusCode: 404,
        message: 'イベントレポートが見つかりません、またはトークンが無効です',
      })
    }

    // バリデーション
    if (!email || !name || !area || !comment) {
      throw createError({
        statusCode: 400,
        message: 'email、name、area、commentは必須項目です',
      })
    }

    // メールアドレスの重複チェック（同じイベントレポートに対して）
    const existingComment = await EventReportComment.findOne({
      where: {
        event_id: eventReport.event_id,
        email: email.toLowerCase().trim(),
      },
    })

    if (existingComment) {
      throw createError({
        statusCode: 400,
        message: 'このメールアドレスは既にコメントを投稿しています',
      })
    }

    const eventReportComment = await EventReportComment.create({
      event_id: eventReport.event_id,
      email: email.toLowerCase().trim(),
      name,
      age: age || null,
      sex: sex || null,
      area,
      comment,
    })

    return {
      success: true,
      data: eventReportComment.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'コメントの投稿に失敗しました ' + error.message,
    })
  }
})
