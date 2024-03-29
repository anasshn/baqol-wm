const { Telegraf } = require('telegraf');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

// Menggunakan environment variable untuk mengakses BOT_TOKEN
const botToken = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID; // Ganti dengan username channel atau chat ID

const bot = new Telegraf(botToken);

// Middleware untuk menanggapi gambar yang dikirim oleh pengguna
bot.on('photo', async (ctx) => {
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  const fileUrl = await ctx.telegram.getFileLink(fileId);

  // Unduh gambar dari URL
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(response.data, 'binary');

  // Tambahkan watermark
  const watermarkedImageBuffer = await addWatermark(imageBuffer);

  // Kirim gambar yang telah diberi watermark ke channel
  ctx.telegram.sendPhoto(channelId, { source: watermarkedImageBuffer });

  // Beri tanggapan ke pengguna
  ctx.reply('Gambar telah diberi watermark dan di-share ke channel.');
});

// Fungsi untuk menambahkan watermark ke gambar
async function addWatermark(imageBuffer) {
  const image = await loadImage(imageBuffer);

  // Set ukuran canvas sesuai dengan dimensi gambar
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Gambar asli
  ctx.drawImage(image, 0, 0);

  // Tambahkan watermark
  ctx.font = '200px Arial';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.67)';
  // ctx.rotate(50);
  ctx.strokeText('baqol', 50, image.height/2);

  // Menghasilkan gambar yang telah diberi watermark
  return canvas.toBuffer();
}

bot.launch();