export default defineEventHandler(async event => {
  try {
    const postalCode = getRouterParam(event, 'code')
      ?.replace(/-/g, '')
      .trim()

    if (!postalCode || postalCode.length !== 7) {
      throw createError({
        statusCode: 400,
        message: '郵便番号は7桁で入力してください',
      })
    }

    // 郵便番号検索API（zipcloud.ibsnet.co.jp）を使用
    const apiUrl = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`

    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data.status !== 200 || !data.results || data.results.length === 0) {
      throw createError({
        statusCode: 404,
        message: '該当する住所が見つかりませんでした',
      })
    }

    const result = data.results[0]
    const address = `${result.address1}${result.address2}${result.address3}`.trim()

    return {
      success: true,
      data: {
        postal_code: result.zipcode,
        prefecture: result.address1,
        city: result.address2,
        town: result.address3,
        address: address,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('郵便番号検索エラー:', error)
    throw createError({
      statusCode: 500,
      message: '郵便番号の検索に失敗しました',
    })
  }
})

