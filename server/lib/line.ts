type LineTextMessage = { type: 'text'; text: string }
type LineTemplateMessage = {
  type: 'template'
  altText: string
  template: {
    type: 'carousel'
    columns: Array<{
      thumbnailImageUrl: string
      imageBackgroundColor?: string
      title: string
      text: string
      defaultAction?: { type: 'uri'; label: string; uri: string }
      actions: Array<
        | { type: 'uri'; label: string; uri: string }
        | { type: 'message'; label: string; text: string }
        | { type: 'postback'; label: string; data: string }
      >
    }>
  }
}
export type LineMessage = LineTextMessage | LineTemplateMessage

export async function pushLineMessage(params: {
  to: string
  messages: LineTextMessage[]
}) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: params.to,
      messages: params.messages,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LINE push failed: ${res.status} ${text}`)
  }
}

export async function replyLineMessage(params: {
  replyToken: string
  messages: LineMessage[]
}) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      replyToken: params.replyToken,
      messages: params.messages,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LINE reply failed: ${res.status} ${text}`)
  }
}

export async function broadcastLineMessage(params: {
  messages: LineMessage[]
}) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set')
  }

  const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: params.messages,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LINE broadcast failed: ${res.status} ${text}`)
  }
}


