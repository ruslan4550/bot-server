const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fetch = require('node-fetch');

// --- SƏNİN MƏLUMATLARIN (Avtomatik əlavə edilib) ---
const BOT_TOKEN = "8940602664:AAGShGKt2zZPVGD_wtYQUKAA5RBvETpG8MA";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://newbot-db894-default-rtdb.europe-west1.firebasedatabase.app";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// OTP Sessiyaları üçün yaddaş
const userSessions = {};

console.log("EliteBot Serveri Başladı...");

// --- FIREBASE FUNKSİYALARI ---
async function getDB(path) {
  try {
    const res = await fetch(`${FIREBASE_URL}/${path}.json`);
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function setDB(path, data) {
  try {
    await fetch(`${FIREBASE_URL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error("Baza Xətası:", e);
  }
}

// --- BOT ƏMRƏLƏRİ VƏ MENYULAR ---
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await setDB(`users/${chatId}/state`, "START");

  const keyboard = {
    inline_keyboard: [
      [{ text: "🇦🇿 Azərbaycan", callback_data: "lang_az" }, { text: "🇹🇷 Türkçe", callback_data: "lang_tr" }],
      [{ text: "🇬🇧 English", callback_data: "lang_en" }, { text: "🇷🇺 Русский", callback_data: "lang_ru" }]
    ]
  };

  bot.sendMessage(chatId, "Dil seçin / Seçim yapın / Select / Выберите:", { reply_markup: keyboard });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // DİL SEÇİMİ
  if (data.startsWith("lang_")) {
    const lang = data.split("_")[1];
    await setDB(`users/${chatId}/lang`, lang);

    const keyboard = {
      inline_keyboard: [
        [{ text: "📢 Məcburi Kanal 1", url: "https://t.me/+-60Ix6CPm0lmMDQ6" }],
        [{ text: "📢 Məcburi Kanal 2", url: "https://t.me/+SX-UgXay5hEzOGYy" }],
        [{ text: "✅ Abunəlikləri Təsdiqlə", callback_data: "check_subscription" }]
      ]
    };
    bot.sendMessage(chatId, "Aşağıdakı kanallara abunə olun:", { reply_markup: keyboard });
  }

  // ANA MENYU
  if (data === "check_subscription") {
    const userLang = await getDB(`users/${chatId}/lang`) || "az";
    let priceUrl = "https://t.me/EliteBotMedia/13";
    if (userLang === "tr") priceUrl = "https://t.me/EliteBotMedia/15";
    if (userLang === "en" || userLang === "ru") priceUrl = "https://t.me/EliteBotMedia/17";

    const keyboard = {
      inline_keyboard: [
        [{ text: "🔑 Lisenziya Aktivləşdir", callback_data: "enter_license" }],
        [{ text: "🛒 Lisenziya Al / Dəstək", url: "https://t.me/EliteNetworkk" }],
        [{ text: "🌐 Web Sitemiz", url: "https://EliteBot.com" }],
        [{ text: "📋 Qiymət Cədvəli", url: priceUrl }]
      ]
    };
    bot.sendMessage(chatId, "✅ Təsdiqləndi! Ana Menyu:", { reply_markup: keyboard });
  }

  if (data === "enter_license") {
    await setDB(`users/${chatId}/state`, "AWAITING_LICENSE");
    bot.sendMessage(chatId, "Lisenziya kodunu daxil edin (Məsələn: ELITE-12345):");
  }
});

// --- MƏTNLƏR (Lisenziya, Nömrə, OTP) ---
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const state = await getDB(`users/${chatId}/state`);

  // LİSENZİYA YOXLAMASI
  if (state === "AWAITING_LICENSE") {
    // Burada qısa olaraq kodun "ELITE-" ilə başlayıb-başlamadığını yoxlayırıq. 
    // Mürəkkəbləşməmək üçün Admin Panel lisenziya yoxlamasını gələcəkdə bura bağlaya bilərik.
    if (!text.startsWith("ELITE-")) {
      return bot.sendMessage(chatId, "❌ Keçərsiz lisenziya kodu.");
    }
    await setDB(`users/${chatId}/activeLicense`, text);
    await setDB(`users/${chatId}/state`, "AWAITING_PHONE");
    return bot.sendMessage(chatId, "✅ Lisenziya təsdiqləndi!\n\nTelegram nömrənizi daxil edin (+ işarəsi ilə. Məs: +994501234567):");
  }

  // NÖMRƏ YOXLAMASI VƏ OTP GÖNDƏRİLMƏSİ
  if (state === "AWAITING_PHONE") {
    if (!text.startsWith("+")) return bot.sendMessage(chatId, "⚠️ Nömrə '+' ilə başlamalıdır!");
    bot.sendMessage(chatId, "⏳ OTP kodu göndərilir, gözləyin...");

    try {
      const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 5 });
      await client.connect();
      const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, text);
      
      userSessions[chatId] = { client, phone: text, phoneCodeHash };
      await setDB(`users/${chatId}/state`, "AWAITING_OTP");
      bot.sendMessage(chatId, "📩 Təhlükəsizlik kodu göndərildi. Kodu aralarında boşluqla daxil edin (Məs: 8 8 9 9 0):");
    } catch (err) {
      bot.sendMessage(chatId, "❌ Xəta: " + err.message);
    }
    return;
  }

  // OTP TƏSDİQİ VƏ SESSİYA YARADILMASI
  if (state === "AWAITING_OTP") {
    const rawOtp = text.replace(/\s+/g, ''); // "8 8 9 9 0" -> "88990"
    const sessionData = userSessions[chatId];
    if (!sessionData) return bot.sendMessage(chatId, "Sessiya tapılmadı, yenidən başlayın.");

    try {
      await sessionData.client.signIn({
        phoneNumber: sessionData.phone,
        phoneCodeHash: sessionData.phoneCodeHash,
        phoneCode: rawOtp,
      });
      const savedSession = sessionData.client.session.save();
      await setDB(`users/${chatId}/telegramSession`, savedSession);
      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      bot.sendMessage(chatId, "✅ Hesaba giriş edildi!\n\nİndi mesajın göndəriləcəyi qrupun *istifadəçi adını* (@ işarəsi olmadan) və ya *linkini* göndərin:");
    } catch (err) {
      bot.sendMessage(chatId, "❌ OTP səhvdir: " + err.message);
    }
    return;
  }

  // QRUP ƏLAVƏ EDİLMƏSİ VƏ DÖVRƏYƏ (LOOP) KEÇİD
  if (state === "AWAITING_GROUP") {
    await setDB(`users/${chatId}/targetGroup`, text);
    await setDB(`users/${chatId}/state`, "AWAITING_INTERVAL");
    bot.sendMessage(chatId, "✅ Qrup əlavə olundu. İndi mesajın neçə dəqiqədən bir atılacağını rəqəmlə yazın (Məs: 2, 3, 5):");
    return;
  }

  if (state === "AWAITING_INTERVAL") {
    const min = parseInt(text);
    if (isNaN(min) || min < 2 || min > 60) return bot.sendMessage(chatId, "⚠️ Zəhmət olmasa 2 ilə 60 arası bir rəqəm yazın.");
    
    await setDB(`users/${chatId}/intervalMinutes`, min);
    await setDB(`users/${chatId}/state`, "BOT_STARTED");
    bot.sendMessage(chatId, `✅ *Bot İşə Düşdü!*\n\nBot hər ${min} dəqiqədən bir Sizin "Saved Messages" (Qeyd olunmuş mesajlar) hissənizdəki ən son mesajı oxuyub qeyd etdiyiniz qrupa atacaq. Botu dayandırmaq üçün /stop yaza bilərsiniz.`, { parse_mode: "Markdown" });
  }
});

// --- AVTOMATİK MESAJ ATMA DÖVRƏSİ ---
// Bot hər 2 dəqiqədən bir bütün bazanı yoxlayır və vaxtı çatanlara mesaj atır
setInterval(async () => {
  const users = await getDB("users");
  if (!users) return;

  for (const chatId in users) {
    const user = users[chatId];
    if (user.state === "BOT_STARTED" && user.telegramSession && user.targetGroup) {
      
      try {
        const client = new TelegramClient(new StringSession(user.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
        await client.connect();
        
        // İstifadəçinin öz 'Saved Messages'-dən ən son mesajı alırıq
        const savedMsgs = await client.getMessages('me', { limit: 1 });
        if (savedMsgs.length > 0) {
          const messageToSend = savedMsgs[0].text;
          // Qrupa mesaj atırıq
          await client.sendMessage(user.targetGroup, { message: messageToSend });
        }
        await client.disconnect();
      } catch (err) {
        console.error("Mesaj atıla bilmədi:", err.message);
      }
    }
  }
}, 120000); // 120000 ms = 2 dəqiqə. Hər 2 dəqiqədən bir bu dövrə işləyir.
