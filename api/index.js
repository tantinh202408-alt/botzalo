import https from 'https';

const BOT_TOKEN = process.env.ZALO_BOT_TOKEN || '1154617076666341503:qQzVddBnvYwiWZaRrmYaPpDDsPKOlLwiTwJYYgHTJVCTwOTmcRYlkPLKRtsxsHbe';

function sendZaloMessage(chatId, text) {
  if (!BOT_TOKEN || !chatId) {
    console.error('Thiếu BOT_TOKEN hoặc chatId:', { chatId });
    return;
  }

  const payload = JSON.stringify({
    chat_id: String(chatId),
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
    let resBody = '';
    res.on('data', chunk => resBody += chunk);
    res.on('end', () => {
      console.log('Phản hồi từ Zalo API:', res.statusCode, resBody);
    });
  });

  req.on('error', (err) => console.error('Lỗi khi gửi sang Zalo:', err));
  req.write(payload);
  req.end();
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('Webhook server botzalo is running!');
  }

  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      console.log('Dữ liệu Zalo gửi tới:', JSON.stringify(data));

      // Bóc tách chatId và Text linh hoạt theo cấu trúc Zalo Bot
      const chatId = data?.message?.chat?.id 
                  || data?.chat_id 
                  || data?.sender?.id 
                  || data?.message?.from?.id 
                  || data?.user_id_by_app 
                  || data?.from?.id;

      const rawText = (data?.message?.text || data?.text || '').trim();

      console.log(`Nhận lệnh: "${rawText}" từ Chat ID: "${chatId}"`);

      if (chatId && rawText) {
        if (rawText === '/hi') {
          sendZaloMessage(chatId, 'sangdev.online đang hoạt động');
        } else if (rawText === '/ping') {
          sendZaloMessage(chatId, 'pong');
        }
      }

      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('Lỗi xử lý webhook:', err);
      return res.status(200).json({ error: err.message });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
