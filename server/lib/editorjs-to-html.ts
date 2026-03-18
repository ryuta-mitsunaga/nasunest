import edjsHTML from 'editorjs-html'

const edjsParser = edjsHTML()

/**
 * Editor.jsのJSON形式データをHTML文字列に変換する
 * @param body - Editor.jsのJSON（オブジェクトまたはJSON文字列）
 * @returns HTML文字列。変換できない場合は空文字
 */
export function editorJsToHtml(body: unknown): string {
  if (!body) return ''

  let data: { blocks?: unknown[] }
  try {
    if (typeof body === 'string') {
      data = JSON.parse(body) as { blocks?: unknown[] }
    } else if (typeof body === 'object' && body !== null) {
      data = body as { blocks?: unknown[] }
    } else {
      return ''
    }
  } catch {
    return ''
  }

  if (!data.blocks || !Array.isArray(data.blocks) || data.blocks.length === 0) {
    return ''
  }

  try {
    const result = edjsParser.parse(data)
    if (typeof result === 'string') {
      return result
    }
    if (Array.isArray(result)) {
      return result.filter(Boolean).join('')
    }
    return ''
  } catch {
    return ''
  }
}
