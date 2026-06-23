export default async function handler(req, res) {
  const allowedOrigins = ['https://ai-event.ru', 'https://www.ai-event.ru'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, contact, history = [] } = req.body;

  if (!contact || typeof contact !== 'string' || contact.trim().length === 0) {
    return res.status(400).json({ error: 'Contact is required' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Notification not configured' });
  }

  const conversation = history
    .map(m => `${m.role === 'user' ? '👤' : '🤖'} ${m.content}`)
    .join('\n\n');

  const text = [
    '🔔 *Новый лид с ai\\-event\\.ru*',
    '',
    `👤 *Имя:* ${escapeMd(name || 'не указано')}`,
    `📱 *Контакт:* ${escapeMd(contact.trim())}`,
    '',
    conversation ? `💬 *Переписка:*\n\`\`\`\n${conversation.slice(0, 3000)}\n\`\`\`` : '_Переписка пуста_',
  ].join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'MarkdownV2' }),
    });
    const data = await r.json();
    if (!data.ok) throw new Error(data.description);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram error:', err.message);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}

function escapeMd(str) {
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}
