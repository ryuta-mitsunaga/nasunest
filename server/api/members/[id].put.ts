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

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const member = await Member.findByPk(id)
    if (!member) {
      throw createError({
        statusCode: 404,
        statusMessage: 'メンバーが見つかりません',
      })
    }

    // Base64文字列をBufferに変換
    let iconBuffer: Buffer | null | undefined = undefined
    if (body.icon && typeof body.icon === 'string') {
      // data:image/png;base64, のプレフィックスを除去
      const base64Data = body.icon.replace(/^data:image\/\w+;base64,/, '')
      iconBuffer = Buffer.from(base64Data, 'base64')
    } else if (body.icon === null) {
      // 明示的にnullが送信された場合はnullを設定（削除）
      iconBuffer = null
    }
    // body.iconがundefinedの場合は、iconBufferもundefinedのまま（既存のiconを保持）

    const updateData: any = {
      name_sei: body.name_sei,
      name_mei: body.name_mei,
      start_date: body.start_date,
      end_date: body.end_date || null,
      mission: body.mission,
      description: body.description,
      x_url: body.x_url || null,
      instagram_url: body.instagram_url || null,
      facebook_url: body.facebook_url || null,
    }
    
    if (iconBuffer !== undefined) {
      updateData.icon = iconBuffer
    }

    await member.update(updateData)
    
    // レスポンス用にiconをBase64文字列に変換
    await member.reload()
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
      statusMessage: 'メンバーの更新に失敗しました',
    })
  }
})

