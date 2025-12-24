export interface EmailTemplate {
  id: string
  title: string
  content: string
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'default',
    title: 'デフォルト',
    content: '',
  },
  {
    id: 'confirmation',
    title: '確認メール',
    content: `
<p>この度は、お申し込みいただきありがとうございます。</p>
<p>以下の内容でお申し込みを受け付けました。</p>
<br>
<p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
<br>
<p>よろしくお願いいたします。</p>
    `.trim(),
  },
  {
    id: 'reminder',
    title: 'リマインダー',
    content: `
<p>お世話になっております。</p>
<p>イベント開催日が近づいてまいりましたので、ご案内いたします。</p>
<br>
<p>当日の詳細については、改めてご連絡いたします。</p>
<p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
<br>
<p>よろしくお願いいたします。</p>
    `.trim(),
  },
  {
    id: 'cancellation',
    title: 'キャンセル通知',
    content: `
<p>この度は、お申し込みいただきありがとうございました。</p>
<p>誠に恐れ入りますが、イベントをキャンセルさせていただくこととなりました。</p>
<br>
<p>ご迷惑をおかけしてしまい、大変申し訳ございません。</p>
<p>何卒ご理解のほど、よろしくお願いいたします。</p>
    `.trim(),
  },
]

