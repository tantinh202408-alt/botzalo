import https from 'https';

const BOT_TOKEN = process.env.ZALO_BOT_TOKEN;

function sendZaloMessage(chatId, text) {
  if (!BOT_TOKEN) return;

  const payload = JSON.stringify({
    chat_id: chatId,
    text: text
  });

  const options = {
    hostname: 'bot-api.zaloplatforms.com',
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options);
  req.on('error', (err) => console.error(err));
  req.write(payload);
  req.end();
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('Bot đang chạy!');
  }

  if (req.method === 'POST') {
    const data = req.body || {};
    const message = data.message || data;
    const chatId = message?.chat?.id || data?.sender?.id || message?.from?.id;
    const rawText = (message?.text || '').trim();

    if (chatId && rawText) {
      if (rawText === '/hi') {
        sendZaloMessage(chatId, 'sangdev.online đang hoạt động');
      } else if (rawText === '/ping') {
        sendZaloMessage(chatId, 'pong');
      }
    }

    return res.status(200).json({ status: 'ok' });
  }

  return res.status(405).send('Method Not Allowed');
}
