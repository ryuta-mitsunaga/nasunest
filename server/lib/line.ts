type LineTextMessage = { type: 'text'; text: string }

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


