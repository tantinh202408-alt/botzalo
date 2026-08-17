import https from 'https';

// Điền trực tiếp Token hoặc cấu hình Environment Variable trên Vercel
const BOT_TOKEN = process.env.ZALO_BOT_TOKEN || '1154617076666341503:qQzVddBnvYwiWZaRrmYaPpDDsPKOlLwiTwJYYgHTJVCTwOTmcRYlkPLKRtsxsHbe';

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

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Zalo Response:', body));
  });

  req.on('error', (err) => console.error('Gửi tin nhắn thất bại:', err));
  req.write(payload);
  req.end();
}

export default async function handler(req, res) {
  // Trả về khi Vercel hoặc Zalo ping kiểm tra server
  if (req.method === 'GET') {
    return res.status(200).send('Webhook bot-token-zl đang chạy!');
  }

  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      
      // Bóc tách chat_id và nội dung tin nhắn gửi đến
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
    } catch (err) {
      console.error(err);
      return res.status(200).json({ status: 'error_handled' });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
