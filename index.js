const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fetch = require('node-fetch');

const BOT_TOKEN = "8940602664:AAGShGKt2zZPVGD_wtYQUKAA5RBvETpG8MA";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://newbot-db894-default-rtdb.europe-west1.firebasedatabase.app";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const userSessions = {};

console.log("EliteBot Serveri Başladı...");

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

// Qrup istifadəçi adını / linkini normallaşdırıb, lazım gələrsə dəvət linkinə
// qoşularaq göndərmə üçün doğru "entity"-ni qaytarır. Bu, XƏTA 3-ü aradan qaldırır:
// əvvəllər link və ya @ad olduğu kimi ötürülürdü və Telegram onu tanıya bilmirdi.
async function resolveTargetEntity(client, rawTarget) {
  let g = String(rawTarget).trim();
  g = g.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '');
  g = g.replace(/^@/, '');

  let inviteHash = null;
  if (g.startsWith('+')) {
    inviteHash = g.slice(1);
  } else if (g.startsWith('joinchat/')) {
    inviteHash = g.slice('joinchat/'.length);
  }

  if (inviteHash) {
    try {
      const result = await client.invoke(new Api.messages.ImportChatInvite({ hash: inviteHash }));
      if (result.chats && result.chats.length > 0) return result.chats[0];
    } catch (err) {
      const msg = (err && err.message) || "";
      if (msg.includes("USER_ALREADY_PARTICIPANT")) {
        const info = await client.invoke(new Api.messages.CheckChatInvite({ hash: inviteHash }));
        if (info.chat) return info.chat;
        if (info.chats && info.chats.length > 0) return info.chats[0];
      } else {
        throw err;
      }
    }
  }

  return g;
}

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

// XƏTA 2 üçün: botu istənilən vaxt dayandırmaq üçün /stop əmri
bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  await setDB(`users/${chatId}/state`, "STOPPED");
  bot.sendMessage(chatId, "⏹ Bot dayandırıldı. Yenidən başlatmaq üçün /resume yazın.");
});

// Dayandırılmış botu, tənzimləmələri itirmədən yenidən işə salmaq üçün
bot.onText(/\/resume/, async (msg) => {
  const chatId = msg.chat.id;
  const groups = await getDB(`users/${chatId}/targetGroups`);
  const interval = await getDB(`users/${chatId}/intervalMinutes`);
  const session = await getDB(`users/${chatId}/telegramSession`);
  if (groups && groups.length > 0 && interval && session) {
    await setDB(`users/${chatId}/state`, "BOT_STARTED");
    bot.sendMessage(chatId, "▶️ Bot yenidən işə düşdü!");
  } else {
    bot.sendMessage(chatId, "⚠️ Bot yenidən başladıla bilmədi. Zəhmət olmasa /start yazaraq tənzimləmələri tamamlayın.");
  }
});

// XƏTA 4 üçün: nömrəni yenidən daxil edib dəyişmək üçün /changenumber əmri
bot.onText(/\/changenumber/, async (msg) => {
  const chatId = msg.chat.id;
  await setDB(`users/${chatId}/telegramSession`, null);
  delete userSessions[chatId];
  await setDB(`users/${chatId}/state`, "AWAITING_PHONE");
  bot.sendMessage(chatId, "🔄 Telefon nömrənizi yenidən daxil edin (+ işarəsi ilə. Məs: +994501234567):");
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

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

  // XƏTA 1 üçün: birdən çox qrup əlavə etmə axını
  if (data === "add_more_group") {
    await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
    bot.sendMessage(chatId, "Əlavə etmək istədiyiniz qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:", { parse_mode: "Markdown" });
  }

  if (data === "finish_groups") {
    await setDB(`users/${chatId}/state`, "AWAITING_INTERVAL");
    bot.sendMessage(chatId, "✅ Qruplar təsdiqləndi. İndi mesajın neçə dəqiqədən bir atılacağını rəqəmlə yazın (Məs: 2, 3, 5):");
  }

  // XƏTA 2 üçün: düymə ilə də dayandırma
  if (data === "stop_bot") {
    await setDB(`users/${chatId}/state`, "STOPPED");
    bot.sendMessage(chatId, "⏹ Bot dayandırıldı. Yenidən başlatmaq üçün /resume yazın.");
  }
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const state = await getDB(`users/${chatId}/state`);

  if (state === "AWAITING_LICENSE") {
    if (!text.startsWith("ELITE-")) {
      return bot.sendMessage(chatId, "❌ Keçərsiz lisenziya kodu.");
    }
    await setDB(`users/${chatId}/activeLicense`, text);
    await setDB(`users/${chatId}/state`, "AWAITING_PHONE");
    return bot.sendMessage(chatId, "✅ Lisenziya təsdiqləndi!\n\nTelegram nömrənizi daxil edin (+ işarəsi ilə. Məs: +994501234567):");
  }

  if (state === "AWAITING_PHONE") {
    if (!text.startsWith("+")) return bot.sendMessage(chatId, "⚠️ Nömrə '+' ilə başlamalıdır!");
    bot.sendMessage(chatId, "⏳ OTP kodu göndərilir, gözləyin...");

    try {
      const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 5 });
      await client.connect();
      const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, text);

      userSessions[chatId] = { client, phone: text, phoneCodeHash };
      await setDB(`users/${chatId}/state`, "AWAITING_OTP");
      bot.sendMessage(chatId, "📩 Təhlükəsizlik kodu göndərildi. Kodu aralarında boşluqla daxil edin (Məs: 8 8 9 9 0):\n\nNömrəni səhv daxil etmisinizsə, /changenumber yazaraq yenidən daxil edə bilərsiniz.");
    } catch (err) {
      bot.sendMessage(chatId, "❌ Xəta: " + err.message);
    }
    return;
  }

  if (state === "AWAITING_OTP") {
    const rawOtp = text.replace(/\s+/g, '');
    const sessionData = userSessions[chatId];

    if (!sessionData) {
      return bot.sendMessage(chatId, "⚠️ Sessiya yaddaşdan silinib. Zəhmət olmasa /start yazaraq prosesə yenidən başlayın.");
    }

    try {
      await sessionData.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: sessionData.phone,
          phoneCodeHash: sessionData.phoneCodeHash,
          phoneCode: rawOtp,
        })
      );

      const savedSession = sessionData.client.session.save();
      await setDB(`users/${chatId}/telegramSession`, savedSession);
      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      bot.sendMessage(chatId, "✅ Hesaba uğurla giriş edildi!\n\nİndi mesajın göndəriləcəyi qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:", { parse_mode: "Markdown" });
    } catch (err) {
      bot.sendMessage(chatId, "❌ OTP səhvdir və ya hesabda 2-Mərhələli təsdiqləmə (2FA) aktivdir. Xəta: " + err.message);
    }
    return;
  }

  // XƏTA 1 üçün: qrupları massiv (array) şəklində saxlayırıq, birdən çox əlavə etmək olur
  if (state === "AWAITING_GROUP") {
    const existing = (await getDB(`users/${chatId}/targetGroups`)) || [];
    existing.push(text);
    await setDB(`users/${chatId}/targetGroups`, existing);

    const keyboard = {
      inline_keyboard: [
        [{ text: "➕ Başqa qrup əlavə et", callback_data: "add_more_group" }],
        [{ text: "✅ Bitir və Davam Et", callback_data: "finish_groups" }]
      ]
    };
    bot.sendMessage(chatId, `✅ Qrup əlavə olundu. (Hazırda ${existing.length} qrup var)\n\nBaşqa qrup əlavə etmək istəyirsiniz, yoxsa davam edək?`, { reply_markup: keyboard });
    return;
  }

  if (state === "AWAITING_INTERVAL") {
    const min = parseInt(text);
    if (isNaN(min) || min < 2 || min > 60) return bot.sendMessage(chatId, "⚠️ Zəhmət olmasa 2 ilə 60 arası bir rəqəm yazın.");

    await setDB(`users/${chatId}/intervalMinutes`, min);
    await setDB(`users/${chatId}/lastSentAt`, 0);
    await setDB(`users/${chatId}/state`, "BOT_STARTED");

    const keyboard = {
      inline_keyboard: [
        [{ text: "⏹ Botu Dayandır", callback_data: "stop_bot" }]
      ]
    };
    bot.sendMessage(chatId, `✅ *Bot İşə Düşdü!*\n\nBot hər ${min} dəqiqədən bir Sizin "Saved Messages" (Qeyd olunmuş mesajlar) hissənizdəki ən son mesajı oxuyub qeyd etdiyiniz qrup(lar)a atacaq.\n\nBotu dayandırmaq üçün /stop yazın və ya aşağıdakı düyməni basın.`, { parse_mode: "Markdown", reply_markup: keyboard });
  }
});

// XƏTA 3 üçün: hər istifadəçinin özünə məxsus interval vaxtına əməl olunur (əvvəllər
// hamı üçün sabit 2 dəqiqə idi) və qrup linki/adı düzgün "entity"-yə çevrilərək göndərilir.
setInterval(async () => {
  const users = await getDB("users");
  if (!users) return;

  for (const chatId in users) {
    const user = users[chatId];
    if (user.state !== "BOT_STARTED" || !user.telegramSession) continue;

    const groups = Array.isArray(user.targetGroups)
      ? user.targetGroups
      : (user.targetGroup ? [user.targetGroup] : []);
    if (groups.length === 0) continue;

    const intervalMs = (user.intervalMinutes || 2) * 60 * 1000;
    const lastSent = user.lastSentAt || 0;
    const now = Date.now();
    if (now - lastSent < intervalMs) continue;

    let client;
    try {
      client = new TelegramClient(new StringSession(user.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
      await client.connect();

      const savedMsgs = await client.getMessages('me', { limit: 1 });
      if (savedMsgs.length > 0) {
        const messageToSend = savedMsgs[0].text || savedMsgs[0].message;
        if (messageToSend) {
          for (const g of groups) {
            try {
              const target = await resolveTargetEntity(client, g);
              await client.sendMessage(target, { message: messageToSend });
            } catch (sendErr) {
              console.error(`(${chatId}) "${g}" qrupuna mesaj atıla bilmədi:`, sendErr.message);
            }
          }
          await setDB(`users/${chatId}/lastSentAt`, now);
        }
      }
    } catch (err) {
      console.error(`(${chatId}) üçün ümumi xəta:`, err.message);
    } finally {
      if (client) {
        try { await client.disconnect(); } catch (e) {}
      }
    }
  }
}, 30000);
