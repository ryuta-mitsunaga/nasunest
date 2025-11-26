import { Member } from '~~/server/database'

export default defineEventHandler(async event => {
  try {
    const members = await Member.findAll({
      order: [['mission', 'ASC']],
    })

    // iconをBase64文字列に変換
    const membersWithIcon = members.map(member => {
      const memberData = member.toJSON()
      if (memberData.icon && Buffer.isBuffer(memberData.icon)) {
        memberData.icon =
          `data:image/png;base64,${memberData.icon.toString('base64')}` as unknown as Buffer<ArrayBufferLike>
      }
      return memberData
    })

    // ミッションごとにグループ化
    const groupedByMission = membersWithIcon.reduce(
      (acc, member) => {
        const mission = member.mission
        if (!acc[mission]) {
          acc[mission] = []
        }
        acc[mission].push(member)
        return acc
      },
      {} as Record<string, typeof membersWithIcon>
    )

    // グループのメンバー数が多い順にソート
    const sortedMissions = Object.keys(groupedByMission).sort((a, b) => {
      return groupedByMission[b].length - groupedByMission[a].length
    })

    // ソートされた順序でメンバーを結合
    const sortedMembers = sortedMissions.flatMap(
      mission => groupedByMission[mission]
    )

    return {
      success: true,
      data: sortedMembers,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch members',
    })
  }
})
