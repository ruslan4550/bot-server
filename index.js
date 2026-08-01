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

// Ana Menyunu Göstərən Funksiya
async function showMainMenu(chatId) {
    const user = await getDB(`users/${chatId}`) || {};
    const activeLicense = user.activeLicense;
    const settings = await getDB('settings') || {};
    const inline_keyboard = [];
    
    if (!activeLicense) {
        inline_keyboard.push([{ text: "🔑 Lisenziya Aktivləşdir", callback_data: "enter_license" }]);
        inline_keyboard.push([{ text: "🛒 Lisenziya Al / Dəstək", url: settings.support || "https://t.me/EliteNetworkk" }]);
        inline_keyboard.push([{ text: "📋 Qiymət Cədvəli", url: settings.priceUrl || "https://t.me/EliteBotMedia/13" }]);
        bot.sendMessage(chatId, "Zəhmət olmasa lisenziya aktivləşdirin:", { reply_markup: { inline_keyboard } });
    } else {
        inline_keyboard.push([{ text: "➕ Yeni Nömrə Əlavə Et", callback_data: "add_new_number" }]);
        inline_keyboard.push([{ text: "⚙️ Hesablarım (Nömrələr)", callback_data: "manage_numbers" }]);
        bot.sendMessage(chatId, "✅ Lisenziya Aktivdir! Ana Menyu:", { reply_markup: { inline_keyboard } });
    }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await setDB(`users/${chatId}/state`, "START");

  const settings = await getDB('settings') || {};
  const greetingMsg = settings.greetingMessage || "Dil seçin / Seçim yapın / Select / Выберите:";

  const keyboard = {
    inline_keyboard: [
      [{ text: "🇦🇿 Azərbaycan", callback_data: "lang_az" }, { text: "🇹🇷 Türkçe", callback_data: "lang_tr" }],
      [{ text: "🇬🇧 English", callback_data: "lang_en" }, { text: "🇷🇺 Русский", callback_data: "lang_ru" }]
    ]
  };
  bot.sendMessage(chatId, greetingMsg, { reply_markup: keyboard });
});

// Bütün hesabları eyni anda dayandırmaq üçün /stop
bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await getDB(`users/${chatId}`);
  if (user && user.accounts) {
      for (const phone in user.accounts) {
          await setDB(`users/${chatId}/accounts/${phone}/status`, "STOPPED");
      }
  }
  bot.sendMessage(chatId, "⏹ Bütün hesablar dayandırıldı. Yenidən başlatmaq üçün menyudan 'Hesablarım' bölməsinə daxil olun.");
});

bot.onText(/\/changenumber/, async (msg) => {
  const chatId = msg.chat.id;
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
    const settings = await getDB('settings') || {};
    
    const ch1 = settings.channel1 || "https://t.me/+-60Ix6CPm0lmMDQ6";
    const ch2 = settings.channel2 || "https://t.me/+SX-UgXay5hEzOGYy";

    const keyboard = {
      inline_keyboard: [
        [{ text: "📢 Məcburi Kanal 1", url: ch1 }],
        [{ text: "📢 Məcburi Kanal 2", url: ch2 }],
        [{ text: "✅ Abunəlikləri Təsdiqlə", callback_data: "check_subscription" }]
      ]
    };
    bot.sendMessage(chatId, "Aşağıdakı kanallara abunə olun:", { reply_markup: keyboard });
  }

  if (data === "check_subscription") {
    // Abunəlik yoxlanıldıqdan sonra birbaşa Ana Menyunu göstəririk
    bot.sendMessage(chatId, "✅ Təsdiqləndi!");
    showMainMenu(chatId);
  }

  if (data === "enter_license") {
    await setDB(`users/${chatId}/state`, "AWAITING_LICENSE");
    bot.sendMessage(chatId, "Lisenziya kodunu daxil edin (Məsələn: ELITE-12345):");
  }

  // Yeni Nömrə Əlavə Etmə Butonu (Limit Yoxlanılır)
  if (data === "add_new_number") {
      const user = await getDB(`users/${chatId}`);
      if (!user.activeLicense) return bot.sendMessage(chatId, "❌ Aktiv lisenziyanız yoxdur.");
      
      const lic = await getDB(`licenses/${user.activeLicense}`);
      if (!lic || !lic.active) return bot.sendMessage(chatId, "❌ Lisenziya etibarsızdır və ya bloklanıb.");

      const accountsCount = user.accounts ? Object.keys(user.accounts).length : 0;
      if (accountsCount >= lic.maxAccounts) {
         return bot.sendMessage(chatId, `❌ Lisenziya limitinizə çatdınız (Maksimum: ${lic.maxAccounts} nömrə). Limit artırmaq üçün dəstək ilə əlaqə saxlayın.`);
      }
      
      await setDB(`users/${chatId}/state`, "AWAITING_PHONE");
      bot.sendMessage(chatId, "📱 Bota qoşmaq istədiyiniz Telegram nömrənizi daxil edin (+ işarəsi ilə. Məs: +994501234567):");
  }

  // Hesabları (Nömrələri) İdarə Etmə Menyusu
  if (data === "manage_numbers") {
      const user = await getDB(`users/${chatId}`);
      if (!user || !user.accounts) return bot.sendMessage(chatId, "⚠️ Hələ heç bir nömrə əlavə edilməyib.");
      
      let msg = "⚙️ *Aktiv Hesablarınız:*\n\n";
      const inline_keyboard = [];
      
      for (const phone in user.accounts) {
          const acc = user.accounts[phone];
          const status = acc.status === "ACTIVE" ? "🟢 Aktiv" : "🔴 Dayandırılıb";
          msg += `📱 Nömrə: +${phone}\n⏳ İnterval: ${acc.intervalMinutes} dəq\n📊 Status: ${status}\n\n`;
          
          const actionText = acc.status === "ACTIVE" ? `Dayandır: +${phone}` : `Başlat: +${phone}`;
          const actionData = acc.status === "ACTIVE" ? `stop_${phone}` : `resume_${phone}`;
          inline_keyboard.push([{ text: actionText, callback_data: actionData }]);
      }
      inline_keyboard.push([{ text: "🔙 Ana Menyu", callback_data: "back_to_main" }]);
      bot.sendMessage(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  // Nömrəni dayandırmaq/başlatmaq
  if (data.startsWith("stop_")) {
      const phoneKey = data.replace("stop_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "STOPPED");
      bot.sendMessage(chatId, `⏹ +${phoneKey} nömrəsi üçün mesaj göndərimi dayandırıldı.`);
      showMainMenu(chatId);
  }
  if (data.startsWith("resume_")) {
      const phoneKey = data.replace("resume_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "ACTIVE");
      bot.sendMessage(chatId, `▶️ +${phoneKey} nömrəsi yenidən işə düşdü.`);
      showMainMenu(chatId);
  }

  if (data === "back_to_main") {
      showMainMenu(chatId);
  }

  if (data === "add_more_group") {
    await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
    bot.sendMessage(chatId, "Əlavə etmək istədiyiniz qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:", { parse_mode: "Markdown" });
  }

  if (data === "finish_groups") {
    await setDB(`users/${chatId}/state`, "AWAITING_INTERVAL");
    bot.sendMessage(chatId, "✅ Qruplar təsdiqləndi. İndi mesajın neçə dəqiqədən bir atılacağını rəqəmlə yazın (Məs: 2, 3, 5):");
  }
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const state = await getDB(`users/${chatId}/state`);

  if (state === "AWAITING_LICENSE") {
    if (!text.startsWith("ELITE-")) return bot.sendMessage(chatId, "❌ Keçərsiz lisenziya kodu formati.");
    
    const lic = await getDB(`licenses/${text}`);
    if (!lic) return bot.sendMessage(chatId, "❌ Belə bir lisenziya bazada mövcud deyil!");
    if (!lic.active) return bot.sendMessage(chatId, "❌ Bu lisenziya bloklanıb!");
    
    // Lisenziya başqasına aiddirsə qəbul etmirik
    if (lic.ownerId && lic.ownerId !== chatId) {
        return bot.sendMessage(chatId, "❌ Bu lisenziya artıq başqa istifadəçi tərəfindən istifadə olunur!");
    }

    // Lisenziyanı bu istifadəçiyə bağlayırıq
    if (!lic.ownerId) {
        await setDB(`licenses/${text}/ownerId`, chatId);
    }
    
    await setDB(`users/${chatId}/activeLicense`, text);
    await setDB(`users/${chatId}/state`, "IDLE");
    
    bot.sendMessage(chatId, "✅ Lisenziya uğurla təsdiqləndi!");
    return showMainMenu(chatId);
  }

  if (state === "AWAITING_PHONE") {
    if (!text.startsWith("+")) return bot.sendMessage(chatId, "⚠️ Nömrə '+' ilə başlamalıdır!");
    bot.sendMessage(chatId, "⏳ OTP kodu göndərilir, gözləyin...");

    try {
      const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 5 });
      await client.connect();
      const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, text);

      userSessions[chatId] = { client, phone: text, phoneCodeHash };
      // Nömrəni yadda saxlayırıq ki, setup prosesində istifadə edək
      await setDB(`users/${chatId}/currentPhoneSetup`, text);
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
    if (!sessionData) return bot.sendMessage(chatId, "⚠️ Sessiya yaddaşdan silinib. Zəhmət olmasa prosesə yenidən başlayın.");

    try {
      await sessionData.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: sessionData.phone,
          phoneCodeHash: sessionData.phoneCodeHash,
          phoneCode: rawOtp,
        })
      );

      const savedSession = sessionData.client.session.save();
      const phoneKey = sessionData.phone.replace('+', ''); // Baza üçün açar yaradırıq

      // Sessiyanı xüsusi nömrənin qovluğuna yazırıq
      await setDB(`users/${chatId}/accounts/${phoneKey}/telegramSession`, savedSession);
      await setDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`, []);
      
      // Admin paneldə görünməsi üçün nömrəni lisenziyaya yazırıq
      const activeLicense = await getDB(`users/${chatId}/activeLicense`);
      await setDB(`licenses/${activeLicense}/registeredPhones/${phoneKey}`, true);

      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      bot.sendMessage(chatId, `✅ ${sessionData.phone} hesabına uğurla giriş edildi!\n\nİndi mesajın göndəriləcəyi qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:`, { parse_mode: "Markdown" });
    } catch (err) {
      bot.sendMessage(chatId, "❌ OTP səhvdir və ya hesabda 2-Mərhələli təsdiqləmə (2FA) aktivdir. Xəta: " + err.message);
    }
    return;
  }

  if (state === "AWAITING_GROUP") {
    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');
    
    const existing = (await getDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`)) || [];
    existing.push(text);
    await setDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`, existing);

    const keyboard = {
      inline_keyboard: [
        [{ text: "➕ Başqa qrup əlavə et", callback_data: "add_more_group" }],
        [{ text: "✅ Bitir və Davam Et", callback_data: "finish_groups" }]
      ]
    };
    bot.sendMessage(chatId, `✅ Qrup əlavə olundu. (Hazırda bu nömrə üçün ${existing.length} qrup var)\n\nBaşqa qrup əlavə etmək istəyirsiniz, yoxsa davam edək?`, { reply_markup: keyboard });
    return;
  }

  if (state === "AWAITING_INTERVAL") {
    const min = parseInt(text);
    if (isNaN(min) || min < 2 || min > 60) return bot.sendMessage(chatId, "⚠️ Zəhmət olmasa 2 ilə 60 arası bir rəqəm yazın.");

    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');

    await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, min);
    await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, 0);
    await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "ACTIVE");
    await setDB(`users/${chatId}/state`, "IDLE");

    bot.sendMessage(chatId, `✅ *Bot İşə Düşdü (${currentPhone})!*\n\nBot hər ${min} dəqiqədən bir Qeyd olunmuş mesajlarınızı (Saved Messages) hədəf qruplara atacaq.\n\nYeni nömrə əlavə etmək və ya idarə etmək üçün Ana Menyuya baxın.`, { parse_mode: "Markdown" });
    showMainMenu(chatId);
  }
});

// Arxa fon intervalı: İndi sadəcə 1 nömrəyə yox, istifadəçinin bütün qeydiyyatlı nömrələrinə (accounts) baxır
setInterval(async () => {
  const users = await getDB("users");
  if (!users) return;

  for (const chatId in users) {
    const user = users[chatId];
    if (!user.accounts) continue;

    for (const phoneKey in user.accounts) {
        const acc = user.accounts[phoneKey];
        if (acc.status !== "ACTIVE" || !acc.telegramSession) continue;

        const groups = acc.targetGroups || [];
        if (groups.length === 0) continue;

        const intervalMs = (acc.intervalMinutes || 2) * 60 * 1000;
        const lastSent = acc.lastSentAt || 0;
        const now = Date.now();
        
        if (now - lastSent < intervalMs) continue;

        let client;
        try {
          client = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
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
                  console.error(`(${phoneKey}) "${g}" qrupuna mesaj atıla bilmədi:`, sendErr.message);
                }
              }
              await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, now);
            }
          }
        } catch (err) {
          console.error(`(${phoneKey}) üçün ümumi xəta:`, err.message);
        } finally {
          if (client) {
            try { await client.disconnect(); } catch (e) {}
          }
        }
    }
  }
}, 30000);
