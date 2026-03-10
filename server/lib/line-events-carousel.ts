import { Event, EventCategory, Form } from '~~/server/database'
import { Op } from 'sequelize'
import dayjs from '~~/server/lib/dayjs'
import type { LineMessage } from './line'

const BASE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://www.nasunest.com'
const DEFAULT_THUMBNAIL = `${BASE_URL}/img/title-logo.png`

/**
 * 指定IDのイベントを取得（公開チェックなし）
 */
export async function getEventById(eventId: number) {
  const ev = await Event.findByPk(eventId, {
    include: [
      {
        model: EventCategory,
        as: 'categories',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        required: false,
      },
      {
        model: Form,
        as: 'form',
        attributes: ['published_end'],
        required: false,
      },
    ],
    attributes: ['id', 'title', 'start_date', 'end_date', 'location_name', 'thumbnail'],
  })
  return ev
}

/**
 * 開催予定のイベントを取得（募集中・未終了）
 */
export async function getUpcomingEvents(limit = 10) {
  const now = dayjs.utc().toDate()

  const events = await Event.findAll({
    where: {
      is_displayed: true,
      [Op.or]: [
        { end_date: null },
        { end_date: { [Op.gte]: now } },
      ],
      [Op.and]: [
        {
          [Op.or]: [
            { published_start: null },
            { published_start: { [Op.lte]: now } },
          ],
        },
        {
          [Op.or]: [
            { published_end: null },
            { published_end: { [Op.gte]: now } },
          ],
        },
      ],
    },
    include: [
      {
        model: EventCategory,
        as: 'categories',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        required: false,
      },
      {
        model: Form,
        as: 'form',
        attributes: ['published_end'],
        required: false,
      },
    ],
    attributes: ['id', 'title', 'start_date', 'end_date', 'location_name', 'thumbnail'],
    order: [['start_date', 'ASC']],
    limit,
  })

  // 募集終了を除外（フォームの公開終了日をチェック）
  const nowDayjs = dayjs.utc()
  return events.filter(ev => {
    const data = ev.toJSON() as any
    const isRecruitmentEnded = data.form?.published_end
      ? dayjs.utc(data.form.published_end).isBefore(nowDayjs)
      : false
    return !isRecruitmentEnded
  })
}

/**
 * イベント一覧をカルーセルメッセージに変換
 */
export function buildEventsCarouselMessage(events: any[]): LineMessage | null {
  if (events.length === 0) return null

  const columns = events.map(ev => {
    const data = ev.toJSON ? ev.toJSON() : ev
    const title = (data.title || 'イベント').slice(0, 40)
    const dateStr = data.start_date
      ? dayjs.utc(data.start_date).tz('Asia/Tokyo').format('M/D(ddd) HH:mm')
      : ''
    const location = (data.location_name || '').slice(0, 20)
    const text = [dateStr, location].filter(Boolean).join(' | ').slice(0, 60)
    const eventUrl = `${BASE_URL}/events/${data.id}`
    const thumbnailUrl = data.thumbnail && data.thumbnail.startsWith('http')
      ? data.thumbnail
      : DEFAULT_THUMBNAIL

    return {
      thumbnailImageUrl: thumbnailUrl,
      imageBackgroundColor: '#FFFFFF',
      title,
      text: text || '詳細はこちら',
      defaultAction: {
        type: 'uri' as const,
        label: '詳細を見る',
        uri: eventUrl,
      },
      actions: [
        {
          type: 'uri' as const,
          label: '詳細を見る',
          uri: eventUrl,
        },
      ],
    }
  })

  return {
    type: 'template',
    altText: '開催予定のイベント一覧',
    template: {
      type: 'carousel',
      columns,
    },
  }
}
