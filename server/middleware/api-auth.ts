export default defineEventHandler(async event => {
  // NOTE:
  // このミドルウェアは元々「/api/* への外部アクセス制限（Origin/Referer/Hostチェック）」を行っていました。
  // ngrok / LIFF 等の外部ドメインでの検証を優先するため、現状は無効化しています。
  // 必要になったら復活させてください。
    return
})
