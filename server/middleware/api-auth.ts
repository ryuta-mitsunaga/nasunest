import { getHeader } from 'h3'

export default defineEventHandler(async event => {
  // 公開用APIも含めて全てのAPIを保護
  // 公開用APIを除外したい場合は以下のコメントを外す
  // if (event.node.req.url?.startsWith('/api/public/')) {
  //   return
  // }

  // Originヘッダーをチェック
  const origin = getHeader(event, 'origin')
  const referer = getHeader(event, 'referer')
  const host = getHeader(event, 'host')

  // 環境変数から許可するホストを取得
  const allowedHosts = process.env.ALLOWED_API_HOSTS
    ? process.env.ALLOWED_API_HOSTS.split(',').map(h => h.trim())
    : []

  // サーバーサイドからの直接アクセス（SSR）は許可
  if (!origin && !referer) {
    return
  }

  // 許可されたホストのリスト
  const allowedHostList = [host || '', `www.${host || ''}`, ...allowedHosts]

  // 開発環境ではlocalhostを許可
  if (process.env.NODE_ENV === 'development') {
    allowedHostList.push(
      'localhost',
      '127.0.0.1',
      'localhost:3000',
      '127.0.0.1:3000'
    )
  }

  // クライアントからのアクセスの場合、同一オリジンかチェック
  if (origin) {
    try {
      const originUrl = new URL(origin)
      const originHost = originUrl.host

      // 許可されたホストかチェック
      if (
        !allowedHostList.some(
          allowedHost =>
            originHost === allowedHost || originHost.endsWith(`.${allowedHost}`)
        )
      ) {
        throw createError({
          statusCode: 403,
          statusMessage: '外部からのアクセスは許可されていません',
        })
      }
    } catch (error: any) {
      // URLのパースに失敗した場合、またはエラーが既にthrowされている場合
      if (error.statusCode === 403) {
        throw error
      }
      throw createError({
        statusCode: 403,
        statusMessage: '外部からのアクセスは許可されていません',
      })
    }
  } else if (referer) {
    // Refererヘッダーからチェック
    try {
      const refererUrl = new URL(referer)
      const refererHost = refererUrl.host

      // 許可されたホストかチェック
      if (
        !allowedHostList.some(
          allowedHost =>
            refererHost === allowedHost ||
            refererHost.endsWith(`.${allowedHost}`)
        )
      ) {
        throw createError({
          statusCode: 403,
          statusMessage: '外部からのアクセスは許可されていません',
        })
      }
    } catch (error: any) {
      // URLのパースに失敗した場合、またはエラーが既にthrowされている場合
      if (error.statusCode === 403) {
        throw error
      }
      throw createError({
        statusCode: 403,
        statusMessage: '外部からのアクセスは許可されていません',
      })
    }
  } else {
    // OriginもRefererもない場合は拒否（ただし、サーバーサイドからの直接アクセスは上で許可済み）
    throw createError({
      statusCode: 403,
      statusMessage: '外部からのアクセスは許可されていません',
    })
  }
})
