import { Member } from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const members = await Member.findAll({
      order: [['start_date', 'DESC']],
    })
    
    // iconをBase64文字列に変換
    const membersWithIcon = members.map((member) => {
      const memberData = member.toJSON()
      if (memberData.icon && Buffer.isBuffer(memberData.icon)) {
        memberData.icon = `data:image/png;base64,${memberData.icon.toString('base64')}`
      }
      return memberData
    })
    
    return {
      success: true,
      data: membersWithIcon,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch members',
    })
  }
})

