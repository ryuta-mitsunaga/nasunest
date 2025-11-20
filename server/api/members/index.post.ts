import { Member } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const adminId = getCookie(event, 'adminId')

    if (!adminId) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です',
      })
    }

    const body = await readBody(event)
    
    // Base64文字列をBufferに変換
    let iconBuffer = null
    if (body.icon && typeof body.icon === 'string') {
      // data:image/png;base64, のプレフィックスを除去
      const base64Data = body.icon.replace(/^data:image\/\w+;base64,/, '')
      iconBuffer = Buffer.from(base64Data, 'base64')
    }
    
    const member = await Member.create({
      name_sei: body.name_sei,
      name_mei: body.name_mei,
      start_date: body.start_date,
      end_date: body.end_date || null,
      mission: body.mission,
      description: body.description,
      icon: iconBuffer,
    })
    
    // レスポンス用にiconをBase64文字列に変換
    const memberData = member.toJSON()
    if (memberData.icon && Buffer.isBuffer(memberData.icon)) {
      memberData.icon = `data:image/png;base64,${memberData.icon.toString('base64')}`
    }

    return {
      success: true,
      data: memberData,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'メンバーの作成に失敗しました',
    })
  }
})

