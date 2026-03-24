import { readRawBody } from 'h3'
import crypto from 'node:crypto'
import { replyLineMessage } from '~~/server/lib/line'
import {
  getUpcomingEvents,
  buildEventsCarouselMessage,
} from '~~/server/lib/line-events-carousel'
import {
  upsertLineOfficialAccount,
  upsertLineOfficialAccountFromMessage,
} from '~~/server/lib/line-official-account'

const POSTBACK_ACTION_EVENTS = 'action=events'

const LINE_OA_TRACKED_EVENT_TYPES = new Set([
  'follow',
  'unfollow',
  'message',
  'postback',
])

export default defineEventHandler(async event => {
  try {
    const channelSecret = process.env.LINE_CHANNEL_SECRET
    if (!channelSecret) {
      console.error('LINE_CHANNEL_SECRET is not set')
      throw createError({
        statusCode: 500,
        message: 'Server configuration error',
      })
    }

    const rawBody = await readRawBody(event)
    if (!rawBody) {
      throw createError({ statusCode: 400, message: 'Empty body' })
    }

    const signature = getHeader(event, 'x-line-signature')
    if (!signature) {
      throw createError({ statusCode: 401, message: 'Missing signature' })
    }

    const hash = crypto
      .createHmac('sha256', channelSecret)
      .update(rawBody)
      .digest('base64')
    if (hash !== signature) {
      throw createError({ statusCode: 401, message: 'Invalid signature' })
    }

    const body = JSON.parse(rawBody) as {
      events?: Array<{
        type: string
        replyToken?: string
        source?: { userId?: string; type?: string }
        postback?: { data?: string }
        message?: { type?: string; text?: string }
      }>
    }

    const events = body.events || []
    if (events.length === 0) return { ok: true }

    const EVENT_TRIGGER_KEYWORDS = ['イベント', 'イベント一覧', '開催予定']

    for (const ev of events) {
      const lineUserId =
        ev.source?.type === 'user' ? ev.source.userId : undefined
      if (lineUserId && LINE_OA_TRACKED_EVENT_TYPES.has(ev.type)) {
        try {
          if (ev.type === 'message') {
            if (ev.message?.type === 'text') {
              await upsertLineOfficialAccountFromMessage({
                lineUserId,
                messageText: ev.message.text,
              })
            } else {
              await upsertLineOfficialAccount({
                lineUserId,
                lastEventType: 'message',
              })
            }
          } else if (ev.type === 'unfollow') {
            await upsertLineOfficialAccount({
              lineUserId,
              lastEventType: 'unfollow',
              isActive: false,
            })
          } else {
            await upsertLineOfficialAccount({
              lineUserId,
              lastEventType: ev.type,
            })
          }
        } catch (err) {
          console.error('line_official_accounts upsert failed:', err)
        }
      }

      if (!ev.replyToken) continue

      let shouldSendEvents = false

      if (ev.type === 'postback') {
        const data = ev.postback?.data || ''
        shouldSendEvents = data === POSTBACK_ACTION_EVENTS || data === 'events'
      } else if (
        ev.type === 'message' &&
        (ev as any).message?.type === 'text'
      ) {
        const text = ((ev as any).message?.text || '').trim()
        shouldSendEvents = EVENT_TRIGGER_KEYWORDS.some(
          kw => text === kw || text.startsWith(kw)
        )
      }

      if (shouldSendEvents) {
        const upcomingEvents = await getUpcomingEvents(10)
        const carouselMessage = buildEventsCarouselMessage(upcomingEvents)

        if (carouselMessage) {
          await replyLineMessage({
            replyToken: ev.replyToken,
            messages: [carouselMessage],
          })
        } else {
          await replyLineMessage({
            replyToken: ev.replyToken,
            messages: [
              {
                type: 'text',
                text: '現在、開催予定のイベントはありません。\n\nイベント情報はWebサイトでご確認ください。\nhttps://www.nasunest.com/events',
              },
            ],
          })
        }
      }
    }

    return { ok: true }
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('LINE webhook error:', err)
    throw createError({ statusCode: 500, message: 'Webhook processing failed' })
  }
})
