import { Form, FormAnswer, Admin } from '~~/server/database'
import { requireAdminId } from '~~/server/lib/admin-auth'

export default defineEventHandler(async event => {
  try {
    // 認証チェック
    const adminId = requireAdminId(event)

    // マスターユーザーかどうかを確認
    const admin = await Admin.findByPk(adminId)
    const isMaster = admin?.isMaster || false

    const formIdParam = getRouterParam(event, 'id')
    if (!formIdParam) {
      throw createError({
        statusCode: 400,
        statusMessage: 'フォームIDが指定されていません',
      })
    }
    const formId = parseInt(formIdParam, 10)
    if (isNaN(formId)) {
      throw createError({
        statusCode: 400,
        statusMessage: '無効なフォームIDです',
      })
    }

    const query = getQuery(event)
    const includeCancelled = query.includeCancelled === 'true'

    // フォームが存在し、管理者のものか確認（マスターユーザーの場合はadmin_idチェックをスキップ）
    const whereCondition: any = { id: formId }
    if (!isMaster) {
      whereCondition.admin_id = adminId
    }

    const form = await Form.findOne({
      where: whereCondition,
    })

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'フォームが見つかりません',
      })
    }

    // 回答データを取得
    const whereClause: any = {
      form_id: formId,
    }
    if (!includeCancelled) {
      whereClause.is_cancel = false
    }

    const answers = await FormAnswer.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    })

    if (answers.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '出力する回答がありません',
      })
    }

    // フォームフィールドを取得
    let formContent: any
    if (typeof form.content === 'string') {
      formContent = JSON.parse(form.content)
    } else {
      formContent = form.content
    }
    const formFields = formContent.fields || []

    // CSVヘッダーを生成
    const headers = [
      'No.',
      '回答日時',
      ...formFields.map((field: any) => field.label || '（未設定）'),
    ]

    // CSVデータ行を生成
    const rows = answers.map((answer, index) => {
      const answerContent = answer.content as Record<string, any>
      const row = [
        String(index + 1),
        formatDate(answer.createdAt),
        ...formFields.map((field: any) => {
          const value = answerContent[field.id]
          return escapeCsvValue(getAnswerValue(value, field))
        }),
      ]
      return row
    })

    // CSV文字列を生成
    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    // BOMを追加してUTF-8でエンコード（Excelで正しく表示されるように）
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    // Content-Typeを設定
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')

    // ファイル名を生成（ASCIIのみ・危険な文字除去）
    const baseName =
      escapeFileName(form.name || 'form')
        // 非ASCII文字を削除
        .replace(/[^\x20-\x7E]/g, '')
        // 先頭・末尾のドットやスペースを削除
        .replace(/^[.\s]+|[.\s]+$/g, '') || 'form'

    const asciiFileName = `${baseName}_answers_${formatDateForFileName(new Date())}.csv`

    // Content-Dispositionヘッダーを設定（RFC 5987に準拠）
    const utf8FileName = `${escapeFileName(form.name || 'フォーム')}_回答一覧_${formatDateForFileName(
      new Date()
    )}.csv`
    const encodedFileName = encodeURIComponent(utf8FileName)
    setHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`
    )

    return csvWithBom
  } catch (error: any) {
    console.error('CSV出力エラー:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `CSV出力に失敗しました: ${error.message || '不明なエラー'}`,
    })
  }
})

// CSV値のエスケープ処理
function escapeCsvValue(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  const stringValue = String(value)
  // カンマ、ダブルクォート、改行が含まれる場合はダブルクォートで囲む
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    // ダブルクォートをエスケープ（""に変換）
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

// 回答値を取得
function getAnswerValue(value: any, field: any): string {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  if (Array.isArray(value)) {
    // 日程調整フィールドの場合は日時をフォーマット
    if (field.type === 'date-picker') {
      return value
        .map((dateTimeString: string) => {
          const [date, time] = dateTimeString.split('T')
          if (date && time) {
            return formatDateOption({ date, time })
          }
          return dateTimeString
        })
        .join(', ')
    }
    return value.join(', ')
  }
  return String(value)
}

// 日時フォーマット
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 日程オプションのフォーマット
function formatDateOption(dateOption: { date: string; time: string }): string {
  if (!dateOption.date || !dateOption.time) {
    return ''
  }
  const date = new Date(`${dateOption.date}T${dateOption.time}`)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}/${day}(${weekday}) ${hours}:${minutes}～`
}

// ファイル名用の日時フォーマット
function formatDateForFileName(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}_${hours}${minutes}`
}

// ファイル名のエスケープ
function escapeFileName(fileName: string): string {
  return fileName.replace(/[\/\\?%*:|"<>]/g, '_')
}
