import { requireAdminId } from '~~/server/lib/admin-auth'
import { broadcastLineMessage } from '~~/server/lib/line'
import {
  getEventById,
  buildEventsCarouselMessage,
} from '~~/server/lib/line-events-carousel'

export default defineEventHandler(async event => {
  const adminId = requireAdminId(event)

  const body = await readBody<{ event_id: number | string }>(event)
  const eventId =
    body?.event_id != null ? parseInt(String(body.event_id), 10) : NaN
  if (!eventId || isNaN(eventId)) {
    throw createError({
      statusCode: 400,
      message: 'event_id が必要です',
    })
  }

  const ev = await getEventById(Number(eventId))
  if (!ev) {
    throw createError({
      statusCode: 404,
      message: 'イベントが見つかりません',
    })
  }

  const textMessage = {
    type: 'text' as const,
    text: 'イベント情報が新しく公開されました！',
  }

  const carouselMessage = buildEventsCarouselMessage([ev])
  const messages = carouselMessage
    ? [textMessage, carouselMessage]
    : [textMessage]

  await broadcastLineMessage({ messages })

  return { success: true, message: 'LINE配信しました' }
})
