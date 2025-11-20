import { Member } from "~~/server/database"

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const member = await Member.findByPk(id)
    if (!member) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Member not found',
      })
    }
    
    // iconをBase64文字列に変換
    const memberData = member.toJSON()
    if (memberData.icon && Buffer.isBuffer(memberData.icon)) {
      memberData.icon = `data:image/png;base64,${memberData.icon.toString('base64')}`
    }
    
    return {
      success: true,
      data: memberData,
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch member',
    })
  }
})

