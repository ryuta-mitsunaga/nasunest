/**
 * 既存のevents・event_reportsのbody（Editor.js JSON）をbody_htmlに変換するスクリプト
 *
 * 実行前にマイグレーション（body_htmlカラム追加）を実行してください。
 * 実行方法: npx tsx server/scripts/migrate-body-to-html.ts
 */

import { Event, EventReport } from '../database/models/index'
import { sequelize } from '../database/config'
import { editorJsToHtml } from '../lib/editorjs-to-html'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../../.env') })

async function migrateBodyToHtml() {
  try {
    console.log('データベース接続中...')
    await sequelize.authenticate()
    console.log('接続成功\n')

    // eventsの変換
    const events = (await Event.findAll({ attributes: ['id', 'title', 'body'] })).filter(
      (e) => e.body != null && e.body.trim() !== ''
    )
    console.log(`イベント: ${events.length}件を処理します`)

    let eventsUpdated = 0
    for (const event of events) {
      const body = event.body
      if (!body) continue

      const bodyHtml = editorJsToHtml(body)
      if (bodyHtml) {
        await event.update({ body_html: bodyHtml })
        eventsUpdated++
        console.log(`  [OK] イベント id=${event.id}: ${event.title}`)
      } else {
        console.log(`  [SKIP] イベント id=${event.id}: 変換結果が空`)
      }
    }
    console.log(`イベント: ${eventsUpdated}件を更新しました\n`)

    // event_reportsの変換
    const eventReports = (
      await EventReport.findAll({ attributes: ['id', 'title', 'body'] })
    ).filter((r) => r.body != null && r.body.trim() !== '')
    console.log(`イベントレポート: ${eventReports.length}件を処理します`)

    let reportsUpdated = 0
    for (const report of eventReports) {
      const body = report.body
      if (!body) continue

      const bodyHtml = editorJsToHtml(body)
      if (bodyHtml) {
        await report.update({ body_html: bodyHtml })
        reportsUpdated++
        console.log(`  [OK] イベントレポート id=${report.id}: ${report.title}`)
      } else {
        console.log(`  [SKIP] イベントレポート id=${report.id}: 変換結果が空`)
      }
    }
    console.log(`イベントレポート: ${reportsUpdated}件を更新しました\n`)

    console.log('完了')
  } catch (error) {
    console.error('エラー:', error)
    throw error
  } finally {
    await sequelize.close()
  }
}

migrateBodyToHtml()
