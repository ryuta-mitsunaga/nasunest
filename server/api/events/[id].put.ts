import { Event, EventCategory, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const id = getRouterParam(event, 'id')
    const whereCondition: any = { id }
    if (!isMaster) {
      whereCondition.admin_id = adminId
    }

    const eventData = await Event.findOne({
      where: whereCondition,
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'イベントが見つかりません',
      })
    }

    const body = await readBody(event)

    // サムネイルURL（クライアント側でアップロード済み）
    // body.thumbnailがundefinedの場合は、thumbnailUrlもundefinedのまま（既存のthumbnailを保持）
    let thumbnailUrl: string | null | undefined = undefined
    if (body.thumbnail !== undefined) {
      thumbnailUrl = body.thumbnail && typeof body.thumbnail === 'string' 
        ? body.thumbnail 
        : null
    }

    const updateData: any = {
      title: body.title,
      form_id: body.form_id || null,
      form_link: body.form_link || null,
      start_date: body.start_date,
      end_date: body.end_date || null,
      description: body.description,
      body: body.body || null,
      location_name: body.location_name || null,
      location_address: body.location_address || null,
      location_url: body.location_url || null,
      cta_button_text: body.cta_button_text || null,
      is_displayed: body.is_displayed,
      published_start: body.published_start || null,
      published_end: body.published_end || null,
      capacity:
        body.capacity !== undefined
          ? body.capacity
            ? parseInt(body.capacity, 10)
            : null
          : undefined,
      approval_type:
        body.approval_type !== undefined
          ? parseInt(body.approval_type, 10)
          : undefined,
      creator_participates:
        body.creator_participates !== undefined
          ? !!body.creator_participates
          : undefined,
      show_creator:
        body.show_creator !== undefined ? !!body.show_creator : undefined,
    }

    if (thumbnailUrl !== undefined) {
      updateData.thumbnail = thumbnailUrl
    }

    await eventData.update(updateData)

    // カテゴリの関連付けを更新
    if (body.category_ids !== undefined) {
      if (Array.isArray(body.category_ids) && body.category_ids.length > 0) {
        const categories = await EventCategory.findAll({
          where: {
            id: body.category_ids,
          },
        })
        await eventData.setCategories(categories)
      } else {
        // 空配列の場合はすべてのカテゴリを削除
        await eventData.setCategories([])
      }
    }

    // カテゴリ情報を含めてリロード
    await eventData.reload({
      include: [
        {
          model: EventCategory,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    return {
      success: true,
      data: eventData.toJSON(),
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'イベントの更新に失敗しました',
    })
  }
})
