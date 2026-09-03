const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const fetch = require('node-fetch');
const http = require('http');

// ============ SERVER VƏ KEEP-ALIVE ============
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("EliteBot tam aktivdir və işləyir.");
}).listen(PORT, () => {
  console.log(`Server ${PORT} portunda işləyir.`);
});

setInterval(() => {
  fetch(`http://localhost:${PORT}`).catch(() => {});
}, 180000);

// ============ KONFİQURASİYA ============
const BOT_TOKEN = "8940602664:AAHbe3HRkoselmfmUgmzvwWuJFfPkrCnKUg";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://botadmin-53dc8-default-rtdb.europe-west1.firebasedatabase.app";

const bot = new TelegramBot(BOT_TOKEN);
bot.deleteWebHook().then(() => {
  console.log("Webhook silindi, polling başladı...");
  bot.startPolling({ restart: true });
}).catch(() => {
  bot.startPolling({ restart: true });
});

// ============ BAZA (FIREBASE) FUNKSİYALARI ============
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
    console.error("DB xətası:", e);
  }
}

// ============ YARDIMÇI DƏYİŞƏNLƏR VƏ SESSİYA İDARƏSİ ============
const userStates = {};
const userSessions = {};
const mainMsgIds = {};
const activeClients = new Map(); 

// Auto-reply və daimi əlaqə üçün əsas funksiya
async function getOrCreateClient(phone, sessionString, chatId) {
  if (activeClients.has(phone)) {
    return activeClients.get(phone);
  }

  const client = new TelegramClient(new StringSession(sessionString), API_ID, API_HASH, { connectionRetries: 5 });
  await client.connect();

  // AVTOCAVAB DİNLƏYİCİSİ (Kənardan mesaj gələndə)
  client.addEventHandler(async (event) => {
    if (event.isPrivate && !event.message.out) { 
      const user = await getDB(`users/${chatId}`);
      if (user && user.autoReplyEnabled) {
        const source = user.autoReplySource || 'me';
        try {
          const entity = await resolveEntity(client, source);
          const msgs = await client.getMessages(entity, { limit: 1 });
          if (msgs && msgs.length > 0) {
            const msg = msgs[0];
            await client.sendMessage(event.message.peerId, { 
              message: msg.message || msg.text || '', 
              replyTo: event.message.id 
            });
          }
        } catch (e) {
          console.error("Avtocavab göndərilərkən xəta:", e.message);
        }
      }
    }
  }, new NewMessage({ incoming: true }));

  activeClients.set(phone, client);
  return client;
}

// Mənbə və ya qrup adını/linkini həll etmək üçün
async function resolveEntity(client, raw) {
  let input = String(raw).trim();
  if (input.startsWith('chat:')) return parseInt(input.slice(5));
  input = input.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '');
  if (input.startsWith('+')) {
    try {
      const res = await client.invoke(new Api.messages.ImportChatInvite({ hash: input.slice(1) }));
      if (res.chats?.length) return res.chats[0];
    } catch (e) {
      if (e.message?.includes('USER_ALREADY_PARTICIPANT')) {
        const info = await client.invoke(new Api.messages.CheckChatInvite({ hash: input.slice(1) }));
        return info.chat || info.chats?.[0];
      }
    }
  }
  return input;
}

// ============ TƏRCÜMƏ BAZASI ============
const langData = {
  az: {
    welcome: "👋 Xoş gəldiniz! Xahiş edirik dil seçin:",
    main_menu: "🤖 *Əsas Menyu*\n\nNə etmək istəyirsiniz?",
    add_account: "➕ Hesab Əlavə Et",
    my_accounts: "📋 Hesablarım",
    auto_reply: "📩 Avtomatik Cavab",
    settings: "⚙️ Ayarlar",
    enter_phone: "📱 Zəhmət olmasa, nömrənizi beynəlxalq formatda daxil edin (məs: +994...):",
    enter_code: "🔐 Telegram-dan gələn 5 rəqəmli kodu daxil edin:",
    enter_2fa: "🔑 İki mərhələli təsdiq (2FA) parolunuzu daxil edin:",
    auth_success: "✅ Hesab uğurla əlavə edildi!",
    auth_fail: "❌ Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
    account_menu: "👤 *Hesab İdarəetməsi* ({phone})\n\nStatus: {status}",
    set_source: "📝 Mesaj Mənbəyi Seç",
    set_groups: "🎯 Hədəf Qrupları",
    set_interval: "⏱️ İnterval",
    start_bot: "▶️ Başlat",
    stop_bot: "⏸️ Dayandır",
    delete_account: "🗑️ Hesabı Sil",
    back_main: "🔙 Əsas Menyu",
    enter_source: "Mənbə göndərin:\nYadda saxlanılanlar üçün 'me' yazın.\nKanal üçün @kanal_adi və ya link göndərin.",
    enter_groups: "Hedef qrupların linklərini və ya adlarını (hər biri bir sətirdə) göndərin:\n\nMəsələn:\n@qrup1\nhttps://t.me/qrup2",
    enter_interval: "⏱️ Mesaj göndərilmə intervalını dəqiqə olaraq daxil edin (məsələn: 2):",
    auto_reply_on: "✅ Açıq",
    auto_reply_off: "❌ Bağlı",
    auto_reply_toggle_on: "🟢 Aktivləşdir",
    auto_reply_toggle_off: "🔴 Deaktiv Et",
    set_auto_reply: "📩 Avtocavab üçün mənbə göndərin (Yadda saxlanılan mesajlar üçün 'me' yazın və ya kanal/qrup linki verin):",
    saved_success: "✅ Yaddaşda saxlanıldı!",
    saved_messages: "Yadda saxlanılan mesajlar (me)"
  },
  tr: {
    welcome: "👋 Hoş geldiniz! Lütfen dil seçin:",
    main_menu: "🤖 *Ana Menü*\n\nNe yapmak istersiniz?",
    add_account: "➕ Hesap Ekle",
    my_accounts: "📋 Hesaplarım",
    auto_reply: "📩 Otomatik Yanıt",
    settings: "⚙️ Ayarlar",
    enter_phone: "📱 Lütfen numaranızı uluslararası formatta girin (örn: +90...):",
    enter_code: "🔐 Telegram'dan gelen 5 haneli kodu girin:",
    enter_2fa: "🔑 İki adımlı doğrulama (2FA) şifrenizi girin:",
    auth_success: "✅ Hesap başarıyla eklendi!",
    auth_fail: "❌ Hata oluştu. Lütfen tekrar deneyin.",
    account_menu: "👤 *Hesap Yönetimi* ({phone})\n\nDurum: {status}",
    set_source: "📝 Mesaj Kaynağı Seç",
    set_groups: "🎯 Hedef Gruplar",
    set_interval: "⏱️ Aralık",
    start_bot: "▶️ Başlat",
    stop_bot: "⏸️ Durdur",
    delete_account: "🗑️ Hesabı Sil",
    back_main: "🔙 Ana Menü",
    enter_source: "Kaynak gönderin:\nKaydedilenler için 'me' yazın.\nKanal için @kanal_adi veya link gönderin.",
    enter_groups: "Hedef grupların linklerini veya adlarını (her biri bir satırda) gönderin:\n\nÖrnek:\n@grup1\nhttps://t.me/grup2",
    enter_interval: "⏱️ Mesaj gönderme aralığını dakika olarak girin (örneğin: 2):",
    auto_reply_on: "✅ Açık",
    auto_reply_off: "❌ Kapalı",
    auto_reply_toggle_on: "🟢 Aktifleştir",
    auto_reply_toggle_off: "🔴 Devre Dışı Bırak",
    set_auto_reply: "📩 Otomatik yanıt kaynağını gönderin (Kaydedilen mesajlar için 'me' yazın veya kanal linki verin):",
    saved_success: "✅ Başarıyla kaydedildi!",
    saved_messages: "Kaydedilen mesajlar (me)"
  },
  en: {
    welcome: "👋 Welcome! Please select a language:",
    main_menu: "🤖 *Main Menu*\n\nWhat would you like to do?",
    add_account: "➕ Add Account",
    my_accounts: "📋 My Accounts",
    auto_reply: "📩 Auto Reply",
    settings: "⚙️ Settings",
    enter_phone: "📱 Please enter your number in international format (e.g. +1...):",
    enter_code: "🔐 Enter the 5-digit code from Telegram:",
    enter_2fa: "🔑 Enter your 2FA password:",
    auth_success: "✅ Account added successfully!",
    auth_fail: "❌ An error occurred. Please try again.",
    account_menu: "👤 *Account Management* ({phone})\n\nStatus: {status}",
    set_source: "📝 Set Message Source",
    set_groups: "🎯 Target Groups",
    set_interval: "⏱️ Interval",
    start_bot: "▶️ Start",
    stop_bot: "⏸️ Stop",
    delete_account: "🗑️ Delete Account",
    back_main: "🔙 Main Menu",
    enter_source: "Send source:\nType 'me' for Saved Messages.\nSend @channel_name or link for channel.",
    enter_groups: "Send target group links or usernames (one per line):\n\nExample:\n@group1\nhttps://t.me/group2",
    enter_interval: "⏱️ Enter message sending interval in minutes (e.g. 2):",
    auto_reply_on: "✅ On",
    auto_reply_off: "❌ Off",
    auto_reply_toggle_on: "🟢 Enable",
    auto_reply_toggle_off: "🔴 Disable",
    set_auto_reply: "📩 Send auto-reply source (Type 'me' for Saved Messages or provide channel link):",
    saved_success: "✅ Saved successfully!",
    saved_messages: "Saved Messages (me)"
  },
  ru: {
    welcome: "👋 Добро пожаловать! Пожалуйста, выберите язык:",
    main_menu: "🤖 *Главное Меню*\n\nЧто бы вы хотели сделать?",
    add_account: "➕ Добавить аккаунт",
    my_accounts: "📋 Мои аккаунты",
    auto_reply: "📩 Автоответ",
    settings: "⚙️ Настройки",
    enter_phone: "📱 Введите ваш номер в международном формате (напр. +7...):",
    enter_code: "🔐 Введите 5-значный код из Telegram:",
    enter_2fa: "🔑 Введите пароль двухэтапной аутентификации (2FA):",
    auth_success: "✅ Аккаунт успешно добавлен!",
    auth_fail: "❌ Произошла ошибка. Пожалуйста, попробуйте снова.",
    account_menu: "👤 *Управление аккаунтом* ({phone})\n\nСтатус: {status}",
    set_source: "📝 Выбрать источник",
    set_groups: "🎯 Целевые группы",
    set_interval: "⏱️ Интервал",
    start_bot: "▶️ Запустить",
    stop_bot: "⏸️ Остановить",
    delete_account: "🗑️ Удалить аккаунт",
    back_main: "🔙 Главное меню",
    enter_source: "Отправьте источник:\nНапишите 'me' для Сохраненных сообщений.\nОтправьте @channel_name или ссылку для канала.",
    enter_groups: "Отправьте ссылки или юзернеймы целевых групп (каждый с новой строки):\n\nПример:\n@group1\nhttps://t.me/group2",
    enter_interval: "⏱️ Введите интервал отправки сообщений в минутах (например: 2):",
    auto_reply_on: "✅ Вкл",
    auto_reply_off: "❌ Выкл",
    auto_reply_toggle_on: "🟢 Включить",
    auto_reply_toggle_off: "🔴 Выключить",
    set_auto_reply: "📩 Отправьте источник автоответа (Напишите 'me' для Сохраненных сообщений или дайте ссылку):",
    saved_success: "✅ Успешно сохранено!",
    saved_messages: "Сохраненные сообщения (me)"
  }
};

function t(key, lang = 'az') {
  return langData[lang][key] || key;
}

async function sendOrUpdate(chatId, text, options) {
  try {
    if (mainMsgIds[chatId]) {
      await bot.editMessageText(text, { chat_id: chatId, message_id: mainMsgIds[chatId], ...options });
    } else {
      const msg = await bot.sendMessage(chatId, text, options);
      mainMsgIds[chatId] = msg.message_id;
    }
  } catch (e) {
    const msg = await bot.sendMessage(chatId, text, options);
    mainMsgIds[chatId] = msg.message_id;
  }
}

// ============ UI MENYULAR ============
async function showLanguageMenu(chatId) {
  const kb = {
    inline_keyboard: [
      [{ text: "🇦🇿 Azərbaycan", callback_data: 'lang_az' }, { text: "🇹🇷 Türkçe", callback_data: 'lang_tr' }],
      [{ text: "🇬🇧 English", callback_data: 'lang_en' }, { text: "🇷🇺 Русский", callback_data: 'lang_ru' }]
    ]
  };
  await sendOrUpdate(chatId, "👋 Xoş gəldiniz! / Welcome! / Добро пожаловать!\n\nZəhmət olmasa dil seçin / Please select a language:", { reply_markup: kb });
}

async function showMainMenu(chatId) {
  const user = await getDB(`users/${chatId}`);
  const lang = user?.lang || 'az';
  const kb = {
    inline_keyboard: [
      [{ text: t('add_account', lang), callback_data: 'add_account' }],
      [{ text: t('my_accounts', lang), callback_data: 'my_accounts' }],
      [{ text: t('auto_reply', lang), callback_data: 'auto_reply_menu' }],
      [{ text: t('settings', lang), callback_data: 'settings' }]
    ]
  };
  await sendOrUpdate(chatId, t('main_menu', lang), { parse_mode: 'Markdown', reply_markup: kb });
}

async function showAccountMenu(chatId, phone) {
  const user = await getDB(`users/${chatId}`);
  const lang = user?.lang || 'az';
  const acc = user.accounts[phone];
  
  const statusIcon = acc.status === 'ACTIVE' ? '🟢' : '🔴';
  const sourceText = acc.messageSource?.type === 'custom' ? acc.messageSource.target : t('saved_messages', lang);
  const groupsText = (acc.targetGroups || []).length;
  const intervalText = acc.intervalMinutes || 2;
  
  let text = t('account_menu', lang).replace('{phone}', phone).replace('{status}', `${statusIcon} ${acc.status}`);
  text += `\n\n📌 Mənbə: ${sourceText}\n🎯 Qruplar: ${groupsText} ədəd\n⏱️ İnterval: ${intervalText} dəq`;
  
  const kb = {
    inline_keyboard: [
      [{ text: t('set_source', lang), callback_data: `set_src_${phone}` }],
      [{ text: t('set_groups', lang), callback_data: `set_grp_${phone}` }],
      [{ text: t('set_interval', lang), callback_data: `set_int_${phone}` }],
      [{ 
        text: acc.status === 'ACTIVE' ? t('stop_bot', lang) : t('start_bot', lang), 
        callback_data: `toggle_${phone}` 
      }],
      [{ text: t('delete_account', lang), callback_data: `del_acc_${phone}` }],
      [{ text: t('back_main', lang), callback_data: 'back_to_main' }]
    ]
  };
  
  await setDB(`users/${chatId}/selectedPhone`, phone);
  await sendOrUpdate(chatId, text, { parse_mode: 'Markdown', reply_markup: kb });
}

async function handleAutoReplyMenu(chatId, lang) {
  const userData = await getDB(`users/${chatId}`) || {};
  const enabled = userData.autoReplyEnabled || false;
  const src = userData.autoReplySource || 'me';
  const sourceDisplay = src === 'me' ? t('saved_messages', lang) : src;
  
  const status = enabled ? t('auto_reply_on', lang) : t('auto_reply_off', lang);
  const toggleText = enabled ? t('auto_reply_toggle_off', lang) : t('auto_reply_toggle_on', lang);
  const toggleData = enabled ? 'auto_reply_disable' : 'auto_reply_enable';
  
  const kb = {
    inline_keyboard: [
      [{ text: '🔄 Mənbəni Dəyiş', callback_data: 'auto_reply_set' }],
      [{ text: toggleText, callback_data: toggleData }],
      [{ text: t('back_main', lang), callback_data: 'back_to_main' }]
    ]
  };
  
  await sendOrUpdate(chatId, `📩 *Avtomatik Cavab*\n\nStatus: ${status}\nMənbə: ${sourceDisplay}`, { parse_mode: 'Markdown', reply_markup: kb });
}

// ============ BOT CALLBACKS ============
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  let user = await getDB(`users/${chatId}`);
  if (!user && !data.startsWith('lang_')) {
    await showLanguageMenu(chatId);
    return;
  }
  const lang = user?.lang || 'az';

  try {
    if (data.startsWith('lang_')) {
      const selectedLang = data.split('_')[1];
      await setDB(`users/${chatId}/lang`, selectedLang);
      await setDB(`users/${chatId}/state`, 'IDLE');
      await showMainMenu(chatId);
    } 
    else if (data === 'back_to_main') {
      await setDB(`users/${chatId}/state`, 'IDLE');
      await showMainMenu(chatId);
    } 
    else if (data === 'add_account') {
      await setDB(`users/${chatId}/state`, 'AWAITING_PHONE');
      bot.sendMessage(chatId, t('enter_phone', lang));
    } 
    else if (data === 'my_accounts') {
      if (!user.accounts || Object.keys(user.accounts).length === 0) {
        bot.answerCallbackQuery(query.id, { text: "Hesab tapılmadı!", show_alert: true });
        return;
      }
      const kb = { inline_keyboard: [] };
      for (const phone in user.accounts) {
        kb.inline_keyboard.push([{ text: `📱 ${phone}`, callback_data: `acc_${phone}` }]);
      }
      kb.inline_keyboard.push([{ text: t('back_main', lang), callback_data: 'back_to_main' }]);
      await sendOrUpdate(chatId, t('my_accounts', lang), { reply_markup: kb });
    } 
    else if (data.startsWith('acc_')) {
      const phone = data.replace('acc_', '');
      await showAccountMenu(chatId, phone);
    }
    // Avtocavab əməliyyatları
    else if (data === 'auto_reply_menu') {
      await handleAutoReplyMenu(chatId, lang);
    }
    else if (data === 'auto_reply_set') {
      await setDB(`users/${chatId}/state`, 'AWAITING_AUTO_REPLY_SOURCE');
      bot.sendMessage(chatId, t('set_auto_reply', lang));
    }
    else if (data === 'auto_reply_enable') {
      await setDB(`users/${chatId}/autoReplyEnabled`, true);
      await handleAutoReplyMenu(chatId, lang);
    }
    else if (data === 'auto_reply_disable') {
      await setDB(`users/${chatId}/autoReplyEnabled`, false);
      await handleAutoReplyMenu(chatId, lang);
    }
    // Hesab konfiqurasiya əməliyyatları
    else if (data.startsWith('set_src_')) {
      await setDB(`users/${chatId}/state`, 'AWAITING_SOURCE');
      bot.sendMessage(chatId, t('enter_source', lang));
    } 
    else if (data.startsWith('set_grp_')) {
      await setDB(`users/${chatId}/state`, 'AWAITING_GROUPS');
      bot.sendMessage(chatId, t('enter_groups', lang));
    } 
    else if (data.startsWith('set_int_')) {
      await setDB(`users/${chatId}/state`, 'AWAITING_INTERVAL');
      bot.sendMessage(chatId, t('enter_interval', lang));
    } 
    else if (data.startsWith('toggle_')) {
      const phone = data.replace('toggle_', '');
      const current = user.accounts[phone].status;
      const newStatus = current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await setDB(`users/${chatId}/accounts/${phone}/status`, newStatus);
      
      // Əgər aktivləşdirsək, yaddaşda dərhal müştərini yaradaq
      if (newStatus === 'ACTIVE' && user.accounts[phone].telegramSession) {
        await getOrCreateClient(phone, user.accounts[phone].telegramSession, chatId);
      }
      await showAccountMenu(chatId, phone);
    } 
    else if (data.startsWith('del_acc_')) {
      const phone = data.replace('del_acc_', '');
      const newAccounts = { ...user.accounts };
      delete newAccounts[phone];
      await setDB(`users/${chatId}/accounts`, newAccounts);
      // Yaddaşdakı aktiv sessiyanı ləğv et
      if (activeClients.has(phone)) {
        const c = activeClients.get(phone);
        await c.disconnect();
        activeClients.delete(phone);
      }
      bot.answerCallbackQuery(query.id, { text: "Hesab silindi!", show_alert: true });
      await showMainMenu(chatId);
    }
    else {
      bot.answerCallbackQuery(query.id);
    }
  } catch (e) {
    console.error("Callback xətası:", e);
  }
});

// ============ BOT MESSAGES ============
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  if (text === '/start') {
    const user = await getDB(`users/${chatId}`);
    if (!user || !user.lang) {
      await showLanguageMenu(chatId);
    } else {
      await setDB(`users/${chatId}/state`, 'IDLE');
      await showMainMenu(chatId);
    }
    return;
  }

  const user = await getDB(`users/${chatId}`);
  if (!user) return;
  const state = user.state || 'IDLE';
  const lang = user.lang || 'az';

  try {
    if (state === 'AWAITING_PHONE') {
      const phone = text.replace(/[^0-9+]/g, '');
      const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, { connectionRetries: 3 });
      await client.connect();
      const sendCodeResult = await client.sendCode({
        apiId: API_ID,
        apiHash: API_HASH
      }, phone);
      
      userSessions[chatId] = { client, phone, phoneCodeHash: sendCodeResult.phoneCodeHash };
      await setDB(`users/${chatId}/state`, 'AWAITING_CODE');
      bot.sendMessage(chatId, t('enter_code', lang));
    } 
    else if (state === 'AWAITING_CODE') {
      const { client, phone, phoneCodeHash } = userSessions[chatId];
      try {
        await client.invoke(new Api.auth.SignIn({
          phoneNumber: phone,
          phoneCodeHash: phoneCodeHash,
          phoneCode: text
        }));
        
        const sessionString = client.session.save();
        await setDB(`users/${chatId}/accounts/${phone}`, {
          telegramSession: sessionString,
          status: 'PAUSED',
          addedAt: Date.now()
        });
        
        await setDB(`users/${chatId}/state`, 'IDLE');
        bot.sendMessage(chatId, t('auth_success', lang));
        await showMainMenu(chatId);
      } catch (e) {
        if (e.message.includes('SESSION_PASSWORD_NEEDED')) {
          await setDB(`users/${chatId}/state`, 'AWAITING_2FA');
          bot.sendMessage(chatId, t('enter_2fa', lang));
        } else {
          bot.sendMessage(chatId, t('auth_fail', lang) + "\n" + e.message);
          await setDB(`users/${chatId}/state`, 'IDLE');
        }
      }
    } 
    else if (state === 'AWAITING_2FA') {
      const { client, phone } = userSessions[chatId];
      try {
        await client.signInWithPassword({
          apiId: API_ID,
          apiHash: API_HASH
        }, {
          password: text,
          onError: (e) => { throw e; }
        });
        
        const sessionString = client.session.save();
        await setDB(`users/${chatId}/accounts/${phone}`, {
          telegramSession: sessionString,
          status: 'PAUSED',
          addedAt: Date.now()
        });
        
        await setDB(`users/${chatId}/state`, 'IDLE');
        bot.sendMessage(chatId, t('auth_success', lang));
        await showMainMenu(chatId);
      } catch (e) {
        bot.sendMessage(chatId, t('auth_fail', lang) + "\n" + e.message);
        await setDB(`users/${chatId}/state`, 'IDLE');
      }
    } 
    // Avtocavab mənbəyinin saxlanması
    else if (state === 'AWAITING_AUTO_REPLY_SOURCE') {
      const source = text.trim() === 'me' ? 'me' : text.trim();
      await setDB(`users/${chatId}/autoReplySource`, source);
      await setDB(`users/${chatId}/autoReplyEnabled`, true);
      await setDB(`users/${chatId}/state`, 'IDLE');
      bot.sendMessage(chatId, t('saved_success', lang));
      await handleAutoReplyMenu(chatId, lang);
    }
    // Qruplara mesaj göndərmə mənbəyi
    else if (state === 'AWAITING_SOURCE') {
      const phone = user.selectedPhone;
      const source = text.trim() === 'me' ? { type: 'saved' } : { type: 'custom', target: text.trim() };
      await setDB(`users/${chatId}/accounts/${phone}/messageSource`, source);
      await setDB(`users/${chatId}/state`, 'IDLE');
      bot.sendMessage(chatId, t('saved_success', lang));
      await showAccountMenu(chatId, phone);
    } 
    else if (state === 'AWAITING_GROUPS') {
      const phone = user.selectedPhone;
      const groups = text.split('\n').map(g => g.trim()).filter(g => g);
      await setDB(`users/${chatId}/accounts/${phone}/targetGroups`, groups);
      await setDB(`users/${chatId}/state`, 'IDLE');
      bot.sendMessage(chatId, t('saved_success', lang));
      await showAccountMenu(chatId, phone);
    } 
    else if (state === 'AWAITING_INTERVAL') {
      const phone = user.selectedPhone;
      const interval = parseInt(text);
      if (isNaN(interval) || interval < 1) {
        bot.sendMessage(chatId, "Xahiş edirik, düzgün rəqəm daxil edin.");
        return;
      }
      await setDB(`users/${chatId}/accounts/${phone}/intervalMinutes`, interval);
      await setDB(`users/${chatId}/state`, 'IDLE');
      bot.sendMessage(chatId, t('saved_success', lang));
      await showAccountMenu(chatId, phone);
    }
  } catch (e) {
    console.error("Mesaj emalı xətası:", e);
  }
});

// ============ QRUPLARA AVTOMATİK GÖNDƏRMƏ INTERVALI ============
setInterval(async () => {
  try {
    const users = await getDB('users');
    if (!users) return;
    for (const chatId in users) {
      const user = users[chatId];
      if (!user.accounts) continue;
      
      for (const phone in user.accounts) {
        const acc = user.accounts[phone];
        if (acc.status !== 'ACTIVE' || !acc.telegramSession) continue;
        
        const groups = acc.targetGroups || [];
        if (groups.length === 0) continue;
        
        const interval = (acc.intervalMinutes || 2) * 60 * 1000;
        if (Date.now() - (acc.lastSentAt || 0) < interval) continue;

        try {
          const client = await getOrCreateClient(phone, acc.telegramSession, chatId);
          const source = acc.messageSource || { type: 'saved' };
          let msgs;
          if (source.type === 'custom' && source.target) {
            const entity = await resolveEntity(client, source.target);
            msgs = await client.getMessages(entity, { limit: 1 });
          } else {
            msgs = await client.getMessages('me', { limit: 1 });
          }
          
          if (msgs && msgs.length > 0) {
            const msg = msgs[0];
            for (const g of groups) {
              try {
                const target = await resolveEntity(client, g);
                if (target) {
                  // Mətni (və varsa medianı kopyalamaq üçün sadə məntiq) qrupa göndərir
                  await client.sendMessage(target, { message: msg.message || msg.text || '' });
                }
              } catch (e) {
                console.error(`${phone} -> ${g} qrupuna göndərilmədi:`, e.message);
              }
            }
            await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, Date.now());
          }
        } catch (e) {
          console.error('Göndərmə xətası:', e.message);
        }
      }
    }
  } catch (e) {
    console.error('Interval əsas xətası:', e);
  }
}, 30000);

// ============ SERVER BAŞLAYANDA AKTİV HESABLARI OYATMAQ ============
setTimeout(async () => {
  console.log("Aktiv sessiyalar yoxlanılır...");
  const users = await getDB('users');
  if (users) {
    for (const chatId in users) {
      if (users[chatId].accounts) {
        for (const phone in users[chatId].accounts) {
          const acc = users[chatId].accounts[phone];
          if (acc.status === 'ACTIVE' && acc.telegramSession) {
            await getOrCreateClient(phone, acc.telegramSession, chatId);
            console.log(`${phone} sessiyası avtomatik başladıldı (Avtocavab üçün dinləmədədir).`);
          }
        }
      }
    }
  }
}, 5000);

console.log('✅ EliteBot tam işə düşdü!');
