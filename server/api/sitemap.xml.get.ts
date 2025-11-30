import { Event } from '~~/server/database'
import { Op } from 'sequelize'

export default defineEventHandler(async event => {
  try {
    const baseUrl = 'https://www.nasunest.com'
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 公開されているイベントを取得
    const events = await Event.findAll({
      where: {
        is_published: true,
        [Op.and]: [
          {
            [Op.or]: [
              { published_start: null },
              { published_start: { [Op.lte]: today } },
            ],
          },
          {
            [Op.or]: [
              { published_end: null },
              { published_end: { [Op.gte]: today } },
            ],
          },
        ],
      },
      attributes: ['id', 'updatedAt'],
      order: [['updatedAt', 'DESC']],
    })

    // 静的ページ
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/events', priority: '0.9', changefreq: 'daily' },
      { url: '/chikiOkoshiMembers', priority: '0.8', changefreq: 'weekly' },
    ]

    // イベントページ
    const eventPages = events.map(event => ({
      url: `/events/${event.id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: event.updatedAt.toISOString().split('T')[0],
    }))

    // XML生成
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`
  )
  .join('\n')}
${eventPages
  .map(
    page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`

    event.node.res.setHeader('Content-Type', 'application/xml')
    return sitemap
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Sitemap生成に失敗しました',
    })
  }
})

