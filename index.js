// index.js - RENDER ÜÇÜN TAM OPTİMİZƏ EDİLMİŞ SÜRƏTLİ VERSİYA
const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Logger } = require('telegram/extensions');
const fetch = require('node-fetch');
const http = require('http');

process.on('uncaughtException', (err) => {
  console.error('Kritik Xəta (Uncaught Exception):', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Tutulmayan Xəta (Unhandled Rejection):', reason);
});

Logger.setLevel('none');

// ============ SERVER ============
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot isleyir.");
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda isleyir.`);
});

setInterval(() => {
  fetch(`http://0.0.0.0:${PORT}`).catch(() => {});
}, 180000);

// ============ KONFİQ ============
const BOT_TOKEN = "8940602664:AAHbe3HRkoselmfmUgmzvwWuJFfPkrCnKUg";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://botadmin-53dc8-default-rtdb.europe-west1.firebasedatabase.app";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("Bot işə düşdü və polling başladı...");

bot.on('polling_error', (error) => {
  console.log('Polling xətası yarandı:', error.message);
});

// ============ DATABASE FUNKSİYALARI ============
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

// ============ DİL FAYLLARI ============
const langData = {
  az: {
    about: "🤖 *ELITE OTOMESAJ BOTU*\n\nXoş gəlmisiniz! Zəhmət olmasa, aşağıdakı menyudan əməliyyat seçin.",
    sub_msg: "Aşağıdakı kanallara abunə olun:",
    sub_btn: "✅ Abunəlikləri Təsdiqlə",
    checking: "⏳ Abunəlik yoxlanılır...",
    confirmed: "✅ Təsdiqləndi!",
    not_subscribed: "❌ Siz hələ bütün kanallara abunə olmamısınız!",
    btn_act_lic: "🔑 Lisenziya Aktivləşdir",
    btn_buy_lic: "🛒 Lisenziya Al / Dəstək",
    btn_price: "📋 Qiymət Cədvəli",
    btn_web: "🌐 Web Sitemiz",
    menu_lic: "✅ Lisenziya Aktivdir! Ana Menyu:",
    btn_add_num: "➕ Yeni Nömrə Əlavə Et",
    btn_manage: "⚙️ Hesablarım",
    enter_lic: "Lisenziya kodunu daxil edin (ELITE-12345):",
    invalid_lic: "❌ Keçərsiz kod formatı.",
    not_found_lic: "❌ Lisenziya tapılmadı.",
    blocked_lic: "❌ Bu lisenziya bloklanıb və ya vaxtı bitib.",
    used_lic: "❌ Bu lisenziya başqa istifadəçi tərəfindən istifadə olunur.",
    success_lic: "✅ Lisenziya aktivləşdirildi!",
    no_lic: "❌ Aktiv lisenziyanız yoxdur.",
    limit_reached: "❌ Lisenziya limitinizə çatdınız (Maks: {max}).",
    enter_phone: "📱 Telegram nömrənizi daxil edin (+994501234567):",
    no_numbers: "⚠️ Hələ heç bir nömrə əlavə edilməyib.",
    my_accounts: "⚙️ *Aktiv Hesablarınız:*\n\n",
    stopped: "🔴 Dayandırılıb",
    active: "🟢 Aktiv",
    stop_btn: "⏹ Dayandır",
    resume_btn: "▶️ Başlat",
    back_main: "🔙 Ana Menyu",
    phone_format: "⚠️ Nömrə '+' ilə başlamalıdır!",
    otp_sent: "⏳ OTP kodu göndərilir...",
    otp_info: "📩 Təhlükəsizlik kodunu daxil edin (boşluqla):",
    err: "❌ Xəta: ",
    sess_lost: "⚠️ Sessiya itdi. Yenidən başlayın.",
    login_success: "✅ {phone} hesabına giriş edildi!\n\nİndi qrupun istifadəçi adını (@) və ya linkini göndərin:",
    otp_err: "❌ OTP səhvdir. Xəta: ",
    group_added: "✅ Qrup əlavə olundu. (Cəmi {count} qrup)",
    add_more: "➕ Başqa qrup əlavə et",
    finish_btn: "✅ Bitir və Davam Et",
    send_group: "Qrupun adını (@) və ya linkini göndərin:",
    ask_interval: "✅ İntervalı daxil edin (2-5 dəqiqə):",
    interval_err: "⚠️ 2 ilə 5 arası rəqəm daxil edin.",
    bot_started: "✅ *Bot İşə Düşdü ({phone})!*\n\nHər {min} dəqiqədən bir mesaj göndəriləcək.",
    ch1_btn: "📢 Məcburi Kanal 1",
    ch2_btn: "📢 Məcburi Kanal 2",
    stop_single: "⏹ +{phone} dayandırıldı.",
    resume_single: "▶️ +{phone} başladı.",
    source_prompt: "📥 Mənbə seçin:",
    source_saved_btn: "💾 Yadda saxlanmış mesajlar",
    source_custom_btn: "🔗 Xüsusi Kanal/Qrup/Bot",
    enter_source: "📢 Mənbə kanalının adını (@) və ya linkini göndərin:",
    invalid_source: "❌ Mənbəyə giriş olmadı.",
    source_set_saved: "✅ Mənbə: Yadda saxlanmış mesajlar.",
    source_set_custom: "✅ Mənbə: {target}",
    cancel_btn: "❌ Ləğv et",
    groups_btn: "📋 Qrupları İdarə Et",
    source_btn: "📥 Mənbəni İdarə Et",
    delete_btn: "🗑 Nömrəni Sil",
    back_btn: "🔙 Geri",
    del_group_btn: "❌ Sil: {group}",
    del_source_btn: "❌ Mənbəni sil",
    no_groups: "❌ Heç bir qrup yoxdur.",
    confirm_delete_num: "❗️ +{phone} silinsin?",
    confirm_delete_num_yes: "✅ Bəli, sil",
    confirm_delete_num_no: "❌ Xeyr",
    num_deleted: "✅ +{phone} silindi.",
    group_deleted: "✅ Qrup silindi.",
    source_deleted: "✅ Mənbə silindi.",
    add_group_btn: "➕ Yeni Qrup Əlavə Et",
    change_source_btn: "🔄 Mənbəni Dəyiş",
    change_interval_btn: "⏱ Intervalı Dəyiş",
    auto_reply_btn: "📩 Avtomatik Cavab",
    set_auto_reply: "📩 Avtomatik cavab mətnini daxil edin:",
    auto_reply_set: "✅ Avtocavab aktivləşdirildi.",
    auto_reply_deleted: "✅ Avtocavab silindi.",
    scan_btn: "🔍 Qrup Skanı",
    scanning: "⏳ Skan edilir...",
    select_groups: "📋 Qruplardan seçin. Seçilmiş: {count}",
    scan_select: "✅ Seç",
    scan_unselect: "❌ Sil",
    scan_confirm: "✅ Tətbiq et",
    scan_more: "⏭ Növbəti",
    scan_back: "⏮ Əvvəlki",
    scan_done: "✅ {count} qrup yeniləndi. Botu başlatmaq üçün '▶️ Başlat' düyməsinə vurun.",
    no_groups_found: "❌ Heç bir qrup tapılmadı.",
    scan_page: "Səhifə {page}/{total}",
    new_interval_prompt: "⏱ Yeni interval (2-5):",
    interval_updated: "✅ İnterval {min} dəqiqəyə dəyişdirildi.",
    session_expired: "⚠️ Sessiya bitdi. Yenidən skan edin.",
    auto_reply_on: "🟢 Avtocavab aktiv",
    auto_reply_off: "🔴 Avtocavab dayandırılıb",
    auto_reply_toggle_on: "▶️ Başlat",
    auto_reply_toggle_off: "⏹ Dayandır",
    auto_reply_enabled: "✅ Avtocavab aktivləşdirildi.",
    auto_reply_disabled: "✅ Avtocavab dayandırıldı.",
    admin_phone_change_prompt: "Nömrə yenilənməsi üçün təsdiq göndərildi."
  }
};

function t(key, lang = 'az', params = {}) {
  let text = langData[lang]?.[key] || langData['az'][key] || key;
  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}

// ============ DEFAULT SETTINGS ============
(async function initSettings() {
  const settings = await getDB('settings');
  if (!settings || !settings.channel1) {
    await setDB('settings', {
      channel1: "https://t.me/+1MsfqoAHmaQ1ZTli",
      channel2: "https://t.me/+v0grkns0s6o5Njky",
      channel1_id: "https://t.me/+1MsfqoAHmaQ1ZTli",
      channel2_id: "https://t.me/+v0grkns0s6o5Njky",
      webUrl: "https://EliteBot.com"
    });
  }
})();

// ============ YARDIMÇI FUNKSİYALAR ============
const userStates = {}; 
const userSessions = {}; 
const mainMsgIds = {}; 

async function sendOrUpdate(chatId, text, options = {}) {
  try {
    if (mainMsgIds[chatId]) {
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: mainMsgIds[chatId],
        ...options
      });
      return;
    }
  } catch (e) {}
  const sent = await bot.sendMessage(chatId, text, options);
  mainMsgIds[chatId] = sent.message_id;
}

async function showMainMenu(chatId) {
  const user = await getDB(`users/${chatId}`);
  const lang = user?.lang || 'az';
  let licActive = false;
  if (user?.activeLicense) {
    const lic = await getDB(`licenses/${user.activeLicense}`);
    if (lic && lic.active && lic.expiresAt && Date.now() < lic.expiresAt) {
      licActive = true;
    }
  }

  const settings = await getDB('settings') || {};
  const channel1 = settings.channel1 || 'https://t.me/+1MsfqoAHmaQ1ZTli';
  const channel2 = settings.channel2 || 'https://t.me/+v0grkns0s6o5Njky';

  const keyboard = [];
  if (!licActive) {
    keyboard.push([
      { text: t('btn_act_lic', lang), callback_data: 'enter_license' },
      { text: t('btn_buy_lic', lang), url: channel2 }
    ]);
    keyboard.push([
      { text: t('btn_price', lang), url: channel2 },
      { text: t('btn_web', lang), url: 'https://EliteBot.com' }
    ]);
  } else {
    keyboard.push([
      { text: t('btn_add_num', lang), callback_data: 'add_new_number' },
      { text: t('btn_manage', lang), callback_data: 'manage_numbers' }
    ]);
    keyboard.push([
      { text: t('auto_reply_btn', lang), callback_data: 'auto_reply_menu' },
      { text: t('btn_price', lang), url: channel2 }
    ]);
    keyboard.push([
      { text: t('btn_buy_lic', lang), url: channel2 },
      { text: t('btn_web', lang), url: 'https://EliteBot.com' }
    ]);
  }

  const aboutText = t('about', lang);
  await sendOrUpdate(chatId, aboutText, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } });
}

async function isSubscribed(userId) {
  return true; // Link tipli məcburi kanallar üçün keçid icazəsi
}

async function resolveEntity(client, raw) {
  let input = String(raw).trim();
  if (input.startsWith('chat:')) {
    let idStr = input.split(' - ')[0].slice(5);
    return idStr; 
  }
  input = input.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '');
  if (input.startsWith('+')) {
    try {
      const res = await client.invoke(new Api.messages.ImportChatInvite({ hash: input.slice(1) }));
      if (res.chats?.length) return res.chats[0].id.toString();
    } catch (e) {
      if (e.message?.includes('USER_ALREADY_PARTICIPANT')) {
        const info = await client.invoke(new Api.messages.CheckChatInvite({ hash: input.slice(1) }));
        return (info.chat || info.chats?.[0])?.id.toString();
      }
    }
  }
  return input;
}

// ============ BOT KOMANDALARI ============
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  mainMsgIds[chatId] = undefined;
  await setDB(`users/${chatId}/state`, 'START');

  const keyboard = {
    inline_keyboard: [
      [{ text: '🇦🇿 Azərbaycan dili', callback_data: 'lang_az' }]
    ]
  };
  const sent = await bot.sendMessage(chatId, 'Dil seçin / Select language:', { reply_markup: keyboard });
  mainMsgIds[chatId] = sent.message_id;
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const user = await getDB(`users/${chatId}`) || {};
  const lang = user.lang || 'az';
  await bot.answerCallbackQuery(query.id);

  if (data.startsWith('lang_')) {
    const newLang = data.split('_')[1];
    await setDB(`users/${chatId}/lang`, newLang);
    const settings = await getDB('settings') || {};
    const keyboard = {
      inline_keyboard: [
        [{ text: t('ch1_btn', newLang), url: settings.channel1 || 'https://t.me/+1MsfqoAHmaQ1ZTli' }],
        [{ text: t('ch2_btn', newLang), url: settings.channel2 || 'https://t.me/+v0grkns0s6o5Njky' }],
        [{ text: t('sub_btn', newLang), callback_data: 'check_sub' }],
        [{ text: t('back_main', newLang), callback_data: 'back_to_main' }]
      ]
    };
    await sendOrUpdate(chatId, t('sub_msg', newLang), { reply_markup: keyboard });
    return;
  }

  if (data === 'check_sub') {
    await showMainMenu(chatId);
    return;
  }

  if (data === 'back_to_main' || data === 'cancel_operation') {
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, 'IDLE');
    await showMainMenu(chatId);
    return;
  }

  if (data === 'enter_license') {
    await setDB(`users/${chatId}/state`, 'AWAITING_LICENSE');
    const keyboard = {
      inline_keyboard: [
        [{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]
      ]
    };
    await sendOrUpdate(chatId, t('enter_lic', lang), { reply_markup: keyboard });
    return;
  }

  if (data === 'add_new_number') {
    const userData = await getDB(`users/${chatId}`);
    if (!userData?.activeLicense) {
      await sendOrUpdate(chatId, t('no_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    const lic = await getDB(`licenses/${userData.activeLicense}`);
    if (!lic?.active || (lic.expiresAt && Date.now() > lic.expiresAt)) {
      await sendOrUpdate(chatId, t('blocked_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    const count = userData.accounts ? Object.keys(userData.accounts).length : 0;
    if (count >= lic.maxAccounts) {
      await sendOrUpdate(chatId, t('limit_reached', lang, { max: lic.maxAccounts }), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    await setDB(`users/${chatId}/state`, 'AWAITING_PHONE');
    const keyboard = {
      inline_keyboard: [
        [{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]
      ]
    };
    await sendOrUpdate(chatId, t('enter_phone', lang), { reply_markup: keyboard });
    return;
  }

  if (data === 'manage_numbers') {
    const userData = await getDB(`users/${chatId}`);
    if (!userData?.accounts || Object.keys(userData.accounts).length === 0) {
      await sendOrUpdate(chatId, t('no_numbers', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    let msg = t('my_accounts', lang);
    const kb = [];
    for (const phone in userData.accounts) {
      const acc = userData.accounts[phone];
      const status = acc.status === 'ACTIVE' ? t('active', lang) : t('stopped', lang);
      const src = acc.messageSource?.type === 'custom' ? `📌 ${acc.messageSource.target}` : '💾 Yadda saxlanmış';
      msg += `📱 +${phone}\n⏳ İnterval: ${acc.intervalMinutes || 0} dəq\n📥 Mənbə: ${src}\n📊 ${status}\n\n`;
      kb.push([
        { text: t('groups_btn', lang), callback_data: `groups_${phone}` },
        { text: t('source_btn', lang), callback_data: `source_${phone}` }
      ]);
      kb.push([
        { text: t('scan_btn', lang), callback_data: `scan_${phone}` },
        { text: t('change_interval_btn', lang), callback_data: `chint_${phone}` }
      ]);
      kb.push([
        { text: acc.status === 'ACTIVE' ? t('stop_btn', lang) : t('resume_btn', lang), callback_data: `toggle_${phone}` },
        { text: t('delete_btn', lang), callback_data: `delete_${phone}` }
      ]);
    }

    if (userData?.activeLicense) {
      const lic = await getDB(`licenses/${userData.activeLicense}`);
      let expText = "Müddətsiz";
      if (lic?.expiresAt) {
         const diff = lic.expiresAt - Date.now();
         if (diff > 0) {
             const days = Math.floor(diff / (1000 * 60 * 60 * 24));
             const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
             expText = `${days} gün ${hours} saat qalıb`;
         } else {
             expText = "Müddəti bitib";
         }
      }
      msg += `🔑 *Lisenziya:* ${userData.activeLicense}\n⏳ *Qalıq müddəti:* ${expText}\n`;
    }

    kb.push([{ text: t('back_main', lang), callback_data: 'back_to_main' }]);
    await sendOrUpdate(chatId, msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: kb } });
    return;
  }

  if (data === 'auto_reply_menu') {
    const userData = await getDB(`users/${chatId}`) || {};
    const enabled = userData.autoReplyEnabled || false;
    const txt = userData.autoReplyMessage || 'Təyin edilməyib';
    const status = enabled ? t('auto_reply_on', lang) : t('auto_reply_off', lang);
    const toggleText = enabled ? t('auto_reply_toggle_off', lang) : t('auto_reply_toggle_on', lang);
    const toggleData = enabled ? 'auto_reply_disable' : 'auto_reply_enable';
    const kb = {
      inline_keyboard: [
        [{ text: '📝 Mesajı Dəyiş', callback_data: 'auto_reply_set' }],
        [{ text: toggleText, callback_data: toggleData }],
        [{ text: t('back_main', lang), callback_data: 'back_to_main' }]
      ]
    };
    await sendOrUpdate(chatId, `📩 *Avtomatik Cavab*\n\nStatus: ${status}\nMətn:\n${txt}`, { parse_mode: 'Markdown', reply_markup: kb });
    return;
  }

  if (data === 'auto_reply_set') {
    await setDB(`users/${chatId}/state`, 'AWAITING_AUTO_REPLY');
    const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
    await sendOrUpdate(chatId, t('set_auto_reply', lang), { reply_markup: kb });
    return;
  }

  if (data === 'auto_reply_enable') {
    await setDB(`users/${chatId}/autoReplyEnabled`, true);
    await sendOrUpdate(chatId, t('auto_reply_enabled', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
    return;
  }

  if (data === 'auto_reply_disable') {
    await setDB(`users/${chatId}/autoReplyEnabled`, false);
    await sendOrUpdate(chatId, t('auto_reply_disabled', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
    return;
  }

  if (data.startsWith('toggle_')) {
    const phone = data.replace('toggle_', '');
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (acc) {
      const newStatus = acc.status === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
      await setDB(`users/${chatId}/accounts/${phone}/status`, newStatus);
      if (newStatus === 'ACTIVE') {
        // BAŞLAT vurulanda anında göndərilməsi üçün lastSentAt-i sıfırlayırıq
        await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, 0);
      }
      const msg = newStatus === 'STOPPED' ? t('stop_single', lang, { phone }) : t('resume_single', lang, { phone });
      bot.sendMessage(chatId, msg).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 5000));
      await bot.emit('callback_query', { message: query.message, data: 'manage_numbers', id: query.id, from: query.from });
    }
    return;
  }

  if (data.startsWith('chint_')) {
    const phone = data.replace('chint_', '');
    await setDB(`users/${chatId}/state`, 'AWAITING_CHANGE_INTERVAL');
    await setDB(`users/${chatId}/changingIntervalPhone`, phone);
    const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
    await sendOrUpdate(chatId, t('new_interval_prompt', lang), { reply_markup: kb });
    return;
  }

  if (data === 'source_saved') {
    const phone = await getDB(`users/${chatId}/currentPhoneSetup`);
    if (phone) {
      await setDB(`users/${chatId}/accounts/${phone}/messageSource`, { type: 'saved' });
      await setDB(`users/${chatId}/state`, 'AWAITING_INTERVAL');
      const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
      await sendOrUpdate(chatId, t('ask_interval', lang), { reply_markup: kb });
    }
    return;
  }

  if (data === 'source_custom') {
    await setDB(`users/${chatId}/state`, 'AWAITING_CUSTOM_SOURCE');
    const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
    await sendOrUpdate(chatId, t('enter_source', lang), { reply_markup: kb });
    return;
  }

  if (data.startsWith('scanselect_')) {
    const idx = parseInt(data.split('_')[1]);
    const session = userSessions[chatId];
    if (!session?.scanGroups) {
      await sendOrUpdate(chatId, t('session_expired', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    if (session.scanSelected.has(idx)) session.scanSelected.delete(idx);
    else session.scanSelected.add(idx);
    await sendScanPage(chatId);
    return;
  }

  if (data === 'scan_confirm') {
    const session = userSessions[chatId];
    if (!session?.scanGroups) {
      await sendOrUpdate(chatId, t('session_expired', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    const phone = session.scanPhone;
    
    const selected = Array.from(session.scanSelected).map(i => {
      const g = session.scanGroups[i];
      return g.username ? `@${g.username}` : `chat:${g.id} - ${g.title}`;
    });
    
    await setDB(`users/${chatId}/accounts/${phone}/targetGroups`, selected);
    
    // TƏTBİQ ET VURULANDA BOT AVTOMATİK BAŞLAMIŞ OLMAZ - STOPPED STATUSDA QALIR
    const currentAcc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (!currentAcc.status) {
      await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED');
    }
    if (!currentAcc.intervalMinutes) {
      await setDB(`users/${chatId}/accounts/${phone}/intervalMinutes`, 2);
    }

    delete userSessions[chatId];
    
    await sendOrUpdate(chatId, t('scan_done', lang, { count: selected.length }), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
    return;
  }

  if (data === 'scan_more') {
    if (!userSessions[chatId]) {
      await sendOrUpdate(chatId, t('session_expired', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    userSessions[chatId].scanPage++;
    await sendScanPage(chatId);
    return;
  }

  if (data === 'scan_back') {
    if (!userSessions[chatId]) {
      await sendOrUpdate(chatId, t('session_expired', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    userSessions[chatId].scanPage--;
    await sendScanPage(chatId);
    return;
  }

  if (data.startsWith('scan_')) {
    const phone = data.replace('scan_', '');
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (!acc?.telegramSession) {
      await sendOrUpdate(chatId, t('no_numbers', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    const wait = await bot.sendMessage(chatId, t('scanning', lang));
    let client;
    try {
      client = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 1 });
      await client.connect();
      const dialogs = await client.getDialogs({ limit: 200 });
      const groups = dialogs.filter(d => d.isGroup || d.isChannel).map(d => ({
        id: (d.entity?.id ? d.entity.id.toString() : d.id.toString()),
        title: d.title || 'Bilinməyən',
        username: d.entity?.username || d.username || ''
      }));
      await bot.deleteMessage(chatId, wait.message_id).catch(() => {});
      if (groups.length === 0) {
        await sendOrUpdate(chatId, t('no_groups_found', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }

      // ƏVVƏLÇƏDƏN SEÇİLMİŞ QRUPLARIN SEÇİLİ SAXLANILMASI FIX-I
      const existing = acc.targetGroups || [];
      const scanSelected = new Set();

      groups.forEach((g, idx) => {
        const check1 = g.username ? `@${g.username}` : '';
        const check2 = `chat:${g.id} - ${g.title}`;
        const check3 = g.id.toString();

        const found = existing.some(ex => {
          if (check1 && ex === check1) return true;
          if (ex === check2) return true;
          if (ex.includes(check3)) return true;
          return false;
        });

        if (found) {
          scanSelected.add(idx);
        }
      });

      userSessions[chatId] = {
        scanGroups: groups,
        scanSelected: scanSelected,
        scanPage: 0,
        scanPhone: phone
      };
      await sendScanPage(chatId);
    } catch (e) {
      await bot.deleteMessage(chatId, wait.message_id).catch(() => {});
      await sendOrUpdate(chatId, t('err', lang) + e.message, { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
    } finally {
      if (client) try { await client.disconnect(); } catch (e) {}
    }
    return;
  }

  if (data.startsWith('groups_')) {
    const phone = data.replace('groups_', '');
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (!acc) {
      await sendOrUpdate(chatId, t('no_numbers', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    
    const groups = acc.targetGroups || [];
    let msg = `📱 *+${phone}* üçün hədəf qruplar:\n\n`;
    const kb = [];
    
    if (groups.length === 0) {
      msg += t('no_groups', lang);
    } else {
      const displayGroups = groups.slice(0, 30);
      displayGroups.forEach((g, i) => {
        let display = g;
        if (g.startsWith('chat:')) {
          const parts = g.split(' - ');
          display = parts.length > 1 ? parts.slice(1).join(' - ') : parts[0];
        }
        msg += `${i+1}. ${display}\n`;
        const safeGroupName = Array.from(display || '').slice(0, 20).join('');
        kb.push([{ text: t('del_group_btn', lang, { group: safeGroupName }), callback_data: `delgroup_${phone}_${i}` }]);
      });
    }
    
    kb.push([{ text: t('add_group_btn', lang), callback_data: `addgroup_${phone}` }]);
    kb.push([{ text: t('back_btn', lang), callback_data: 'manage_numbers' }]);
    kb.push([{ text: t('back_main', lang), callback_data: 'back_to_main' }]);
    
    await sendOrUpdate(chatId, msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: kb } });
    return;
  }

  if (data.startsWith('delgroup_')) {
    const parts = data.split('_');
    const phone = parts[1];
    const idx = parseInt(parts[2]);
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (acc?.targetGroups) {
      acc.targetGroups.splice(idx, 1);
      await setDB(`users/${chatId}/accounts/${phone}/targetGroups`, acc.targetGroups);
      bot.sendMessage(chatId, t('group_deleted', lang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
      await bot.emit('callback_query', { message: query.message, data: `groups_${phone}`, id: query.id, from: query.from });
    }
    return;
  }

  if (data.startsWith('addgroup_')) {
    const phone = data.replace('addgroup_', '');
    await setDB(`users/${chatId}/state`, 'AWAITING_GROUP');
    await setDB(`users/${chatId}/currentPhoneSetup`, phone);
    const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
    await sendOrUpdate(chatId, t('send_group', lang), { parse_mode: 'Markdown', reply_markup: kb });
    return;
  }

  if (data.startsWith('source_')) {
    const phone = data.replace('source_', '');
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (!acc) return;
    const src = acc.messageSource;
    let msg = `📥 *+${phone}* mesaj mənbəyi:\n\n`;
    if (!src || src.type === 'saved') msg += '💾 Yadda saxlanmış mesajlar';
    else msg += `🔗 Xüsusi mənbə: ${src.target}`;
    const kb = [
      [{ text: t('del_source_btn', lang), callback_data: `delsource_${phone}` }],
      [{ text: t('change_source_btn', lang), callback_data: `changesource_${phone}` }],
      [{ text: t('back_btn', lang), callback_data: 'manage_numbers' }],
      [{ text: t('back_main', lang), callback_data: 'back_to_main' }]
    ];
    await sendOrUpdate(chatId, msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: kb } });
    return;
  }

  if (data.startsWith('delsource_')) {
    const phone = data.replace('delsource_', '');
    await setDB(`users/${chatId}/accounts/${phone}/messageSource`, { type: 'saved' });
    bot.sendMessage(chatId, t('source_deleted', lang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
    await bot.emit('callback_query', { message: query.message, data: `source_${phone}`, id: query.id, from: query.from });
    return;
  }

  if (data.startsWith('changesource_')) {
    const phone = data.replace('changesource_', '');
    await setDB(`users/${chatId}/state`, 'AWAITING_CUSTOM_SOURCE');
    await setDB(`users/${chatId}/currentPhoneSetup`, phone);
    const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
    await sendOrUpdate(chatId, t('enter_source', lang), { reply_markup: kb });
    return;
  }

  if (data.startsWith('delete_')) {
    const phone = data.replace('delete_', '');
    const kb = {
      inline_keyboard: [
        [{ text: t('confirm_delete_num_yes', lang), callback_data: `confirm_delete_${phone}` }],
        [{ text: t('confirm_delete_num_no', lang), callback_data: 'manage_numbers' }]
      ]
    };
    await sendOrUpdate(chatId, t('confirm_delete_num', lang, { phone }), { reply_markup: kb });
    return;
  }

  if (data.startsWith('confirm_delete_')) {
    const phone = data.replace('confirm_delete_', '');
    await setDB(`users/${chatId}/accounts/${phone}`, null);
    bot.sendMessage(chatId, t('num_deleted', lang, { phone })).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, 'IDLE');
    await showMainMenu(chatId);
    return;
  }

  if (data === 'add_more_group') {
    await setDB(`users/${chatId}/state`, 'AWAITING_GROUP');
    const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
    await sendOrUpdate(chatId, t('send_group', lang), { parse_mode: 'Markdown', reply_markup: kb });
    return;
  }

  if (data === 'finish_groups') {
    await setDB(`users/${chatId}/state`, 'AWAITING_SOURCE');
    const kb = {
      inline_keyboard: [
        [{ text: t('source_saved_btn', lang), callback_data: 'source_saved' }],
        [{ text: t('source_custom_btn', lang), callback_data: 'source_custom' }],
        [{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]
      ]
    };
    await sendOrUpdate(chatId, t('source_prompt', lang), { reply_markup: kb });
    return;
  }

});

async function sendScanPage(chatId) {
  const session = userSessions[chatId];
  if (!session?.scanGroups) return;
  const user = await getDB(`users/${chatId}`) || {};
  const lang = user.lang || 'az';
  const perPage = 5;
  const total = Math.ceil(session.scanGroups.length / perPage);
  let page = session.scanPage;
  if (page >= total) page = total - 1;
  if (page < 0) page = 0;
  session.scanPage = page;
  const start = page * perPage;
  const slice = session.scanGroups.slice(start, start + perPage);
  let text = t('select_groups', lang, { count: session.scanSelected.size }) + '\n\n';
  text += `📖 ${t('scan_page', lang, { page: page + 1, total })}`;
  const kb = { inline_keyboard: [] };
  
  slice.forEach((g, i) => {
    const idx = start + i;
    const sel = session.scanSelected.has(idx);
    const emoji = sel ? '✅' : '⬜';
    const safeTitle = Array.from(g.title || 'Bilinməyən').slice(0, 22).join('');
    kb.inline_keyboard.push([{ text: `${emoji} ${safeTitle}`, callback_data: `scanselect_${idx}` }]);
  });
  
  const nav = [];
  if (page > 0) nav.push({ text: t('scan_back', lang), callback_data: 'scan_back' });
  if (page < total - 1) nav.push({ text: t('scan_more', lang), callback_data: 'scan_more' });
  if (nav.length) kb.inline_keyboard.push(nav);
  kb.inline_keyboard.push([{ text: t('scan_confirm', lang), callback_data: 'scan_confirm' }]);
  kb.inline_keyboard.push([{ text: t('back_btn', lang), callback_data: 'manage_numbers' }]);
  await sendOrUpdate(chatId, text, { reply_markup: kb });
}

// ============ MESSAGE HANDLER ============
bot.on('message', async (msg) => {
  try {
    if (!msg.text || msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const botInfo = await bot.getMe();
    if (msg.from.id === botInfo.id) return;

    const user = await getDB(`users/${chatId}`) || {};
    const lang = user.lang || 'az';
    const state = await getDB(`users/${chatId}/state`) || 'IDLE';

    const text = msg.text.trim();

    if (text === t('cancel_btn', lang)) {
      delete userSessions[chatId];
      await setDB(`users/${chatId}/state`, 'IDLE');
      await showMainMenu(chatId);
      return;
    }

    if (state === 'AWAITING_LICENSE') {
      if (!text.startsWith('ELITE-')) {
        await sendOrUpdate(chatId, t('invalid_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      const lic = await getDB(`licenses/${text}`);
      if (!lic) {
        await sendOrUpdate(chatId, t('not_found_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      if (!lic.active) {
        await sendOrUpdate(chatId, t('blocked_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      if (lic.usedBy && lic.usedBy !== chatId) {
        await sendOrUpdate(chatId, t('used_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }

      // LİSENZİYA AKTİVLƏŞDİRİLDİKDƏ MÜDDƏTİN DƏQİQ HESABLANMASI
      const now = Date.now();
      let expiresAt = lic.expiresAt;
      if (!lic.activatedAt) {
        const days = lic.durationDays || 30;
        expiresAt = now + (days * 24 * 60 * 60 * 1000);
        await setDB(`licenses/${text}/activatedAt`, now);
        await setDB(`licenses/${text}/expiresAt`, expiresAt);
      }

      if (expiresAt && now > expiresAt) {
        await setDB(`licenses/${text}/active`, false);
        await sendOrUpdate(chatId, t('blocked_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }

      if (!lic.usedBy) await setDB(`licenses/${text}/usedBy`, chatId);
      await setDB(`users/${chatId}/activeLicense`, text);
      await setDB(`users/${chatId}/state`, 'IDLE');
      bot.sendMessage(chatId, t('success_lic', lang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
      await showMainMenu(chatId);
      return;
    }

    if (state === 'AWAITING_PHONE') {
      if (!text.startsWith('+')) {
        await sendOrUpdate(chatId, t('phone_format', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      const wait = await bot.sendMessage(chatId, t('otp_sent', lang));
      try {
        const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, { connectionRetries: 3 });
        await client.connect();
        const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, text);
        userSessions[chatId] = { client, phone: text, phoneCodeHash };
        await setDB(`users/${chatId}/currentPhoneSetup`, text);
        await setDB(`users/${chatId}/state`, 'AWAITING_OTP');
        await bot.deleteMessage(chatId, wait.message_id).catch(() => {});
        const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
        await sendOrUpdate(chatId, t('otp_info', lang), { reply_markup: kb });
      } catch (e) {
        await bot.deleteMessage(chatId, wait.message_id).catch(() => {});
        await sendOrUpdate(chatId, t('err', lang) + e.message, { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      }
      return;
    }

    if (state === 'AWAITING_OTP') {
      const session = userSessions[chatId];
      if (!session) {
        await sendOrUpdate(chatId, t('sess_lost', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      const otp = text.replace(/\s/g, '');
      try {
        await session.client.invoke(new Api.auth.SignIn({
          phoneNumber: session.phone,
          phoneCodeHash: session.phoneCodeHash,
          phoneCode: otp
        }));
        const saved = session.client.session.save();
        const phoneKey = session.phone.replace('+', '');
        
        await setDB(`users/${chatId}/accounts/${phoneKey}/telegramSession`, saved);
        await setDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`, []);
        await setDB(`users/${chatId}/accounts/${phoneKey}/status`, 'STOPPED'); 
        await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, 2);
        await setDB(`users/${chatId}/accounts/${phoneKey}/messageSource`, { type: 'saved' });
        
        const userData = await getDB(`users/${chatId}`);
        if (userData?.activeLicense) {
          await setDB(`licenses/${userData.activeLicense}/registeredPhones/${phoneKey}`, true);
        }
        await setDB(`users/${chatId}/state`, 'AWAITING_GROUP');
        await setDB(`users/${chatId}/currentPhoneSetup`, phoneKey);
        const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
        await sendOrUpdate(chatId, t('login_success', lang, { phone: session.phone }), { parse_mode: 'Markdown', reply_markup: kb });
      } catch (e) {
        await sendOrUpdate(chatId, t('otp_err', lang) + e.message, { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      }
      return;
    }

    if (state === 'AWAITING_GROUP') {
      const phone = await getDB(`users/${chatId}/currentPhoneSetup`);
      if (!phone) return showMainMenu(chatId);
      const existing = await getDB(`users/${chatId}/accounts/${phone}/targetGroups`) || [];
      existing.push(text);
      await setDB(`users/${chatId}/accounts/${phone}/targetGroups`, existing);
      const kb = {
        inline_keyboard: [
          [{ text: t('add_more', lang), callback_data: 'add_more_group' }],
          [{ text: t('finish_btn', lang), callback_data: 'finish_groups' }],
          [{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]
        ]
      };
      await sendOrUpdate(chatId, t('group_added', lang, { count: existing.length }), { reply_markup: kb });
      return;
    }

    if (state === 'AWAITING_CUSTOM_SOURCE') {
      const phone = await getDB(`users/${chatId}/currentPhoneSetup`);
      if (!phone) return showMainMenu(chatId);
      const acc = await getDB(`users/${chatId}/accounts/${phone}`);
      if (!acc?.telegramSession) {
        await sendOrUpdate(chatId, t('sess_lost', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      let cl;
      try {
        cl = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 1 });
        await cl.connect();
        const entityTarget = await resolveEntity(cl, text);
        const entity = await cl.getEntity(entityTarget).catch(() => entityTarget);
        await cl.getMessages(entity, { limit: 1 });
      } catch (e) {
        if (cl) try { await cl.disconnect(); } catch (e2) {}
        await sendOrUpdate(chatId, t('invalid_source', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      } finally {
        if (cl) try { await cl.disconnect(); } catch (e) {}
      }
      await setDB(`users/${chatId}/accounts/${phone}/messageSource`, { type: 'custom', target: text });
      await setDB(`users/${chatId}/state`, 'AWAITING_INTERVAL');
      const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
      await sendOrUpdate(chatId, t('ask_interval', lang), { reply_markup: kb });
      return;
    }

    if (state === 'AWAITING_INTERVAL' || state === 'AWAITING_CHANGE_INTERVAL') {
      const min = parseInt(text);
      if (isNaN(min) || min < 2 || min > 5) {
        await sendOrUpdate(chatId, t('interval_err', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      if (state === 'AWAITING_CHANGE_INTERVAL') {
        const phone = await getDB(`users/${chatId}/changingIntervalPhone`);
        if (phone) {
          await setDB(`users/${chatId}/accounts/${phone}/intervalMinutes`, min);
          await setDB(`users/${chatId}/state`, 'IDLE');
          await setDB(`users/${chatId}/changingIntervalPhone`, null);
          bot.sendMessage(chatId, t('interval_updated', lang, { min })).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
          await showMainMenu(chatId);
        }
        return;
      }
      const phone = await getDB(`users/${chatId}/currentPhoneSetup`);
      if (phone) {
        await setDB(`users/${chatId}/accounts/${phone}/intervalMinutes`, min);
        await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED'); // Bura dəyişdirildi - ancaq "BAŞLASIN" dəyişə bilər
        await setDB(`users/${chatId}/state`, 'IDLE');
        delete userSessions[chatId];
        await sendOrUpdate(chatId, `✅ İnterval ${min} dəqiqə olaraq saxlanıldı. Botu işə salmaq üçün '⚙️ Hesablarım' bölməsindən '▶️ Başlat' vurmağınız kifayətdir.`, { parse_mode: 'Markdown' });
      }
      return;
    }

    if (state === 'AWAITING_AUTO_REPLY') {
      await setDB(`users/${chatId}/autoReplyMessage`, text);
      await setDB(`users/${chatId}/autoReplyEnabled`, true);
      await setDB(`users/${chatId}/state`, 'IDLE');
      bot.sendMessage(chatId, t('auto_reply_set', lang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 5000));
      await showMainMenu(chatId);
      return;
    }
  } catch (e) {
    console.error('Message handler xətası:', e);
  }
});


// ============ PARALEL MESAJ GÖNDƏRMƏ VƏ AVTOCAVAB SİSTEMİ ============
setInterval(async () => {
  try {
    const users = await getDB('users');
    if (!users) return;
    
    const tasks = []; 
    
    for (const chatId in users) {
      const user = users[chatId];
      if (!user.accounts) continue;

      // Lisenziya Vaxtının Kontrolü
      if (user.activeLicense) {
        const lic = await getDB(`licenses/${user.activeLicense}`);
        if (!lic || !lic.active || (lic.expiresAt && Date.now() > lic.expiresAt)) {
          continue; 
        }
      } else {
        continue;
      }
      
      for (const phone in user.accounts) {
        const acc = user.accounts[phone];
        if (acc.status !== 'ACTIVE' || !acc.telegramSession) continue;
        
        const groups = acc.targetGroups || [];
        const interval = (acc.intervalMinutes || 2) * 60 * 1000;
        const timeToSendMessage = (Date.now() - (acc.lastSentAt || 0) >= interval) && groups.length > 0;
        
        if (timeToSendMessage || (user.autoReplyEnabled && user.autoReplyMessage)) {
          tasks.push(processAccountTask(chatId, phone, user, acc, timeToSendMessage, groups));
        }
      }
    }
    
    await Promise.allSettled(tasks);
    
  } catch (e) {
    console.error('Interval xətası:', e);
  }
}, 10000); // Daha tez reaksiyalar üçün dövr 10 saniyəyə endirildi

async function processAccountTask(chatId, phone, user, acc, timeToSendMessage, groups) {
  let client;
  try {
    client = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 1 });
    await client.connect();
    
    if (timeToSendMessage) {
      const source = acc.messageSource || { type: 'saved' };
      let sourceEntity = 'me';
      if (source.type === 'custom' && source.target) {
        const entityTarget = await resolveEntity(client, source.target);
        sourceEntity = await client.getEntity(entityTarget).catch(() => entityTarget);
      }
      
      for (const g of groups) {
        try {
          const msgs = await client.getMessages(sourceEntity, { limit: 1 });
          if (msgs && msgs.length > 0) {
            const msg = msgs[0];
            const targetStr = await resolveEntity(client, g);
            const peer = (typeof targetStr === 'string' && /^-?\d+$/.test(targetStr)) ? BigInt(targetStr) : targetStr;
            const target = await client.getEntity(peer).catch(() => peer);
            
            if (target) {
              if (msg.message || msg.media) {
                 await client.sendMessage(target, { message: msg.message || '', file: msg.media });
                 
                 // Qrup Adının Müəyyən Edilməsi
                 let groupTitle = g;
                 if (g.startsWith('chat:')) {
                    groupTitle = g.split(' - ')[1] || g;
                 } else if (target.title) {
                    groupTitle = target.title;
                 }

                 // BİLDİRİŞ MESAJI VƏ 10-15 SANİYƏLİK SİLİNMƏ LENTİ
                 bot.sendMessage(chatId, `📢 *${groupTitle}* qrupuna mesaj atıldı!`, { parse_mode: 'Markdown' }).then(sentNotif => {
                   setTimeout(() => {
                     bot.deleteMessage(chatId, sentNotif.message_id).catch(() => {});
                   }, 12000); // 12 saniyə sonra avtomatik silinir
                 }).catch(() => {});

                 // RANDOM SPAM QORUNMASI (3-7 saniyə aralığında gözləmə)
                 const randomWait = Math.floor(Math.random() * 4000) + 3000;
                 await new Promise(r => setTimeout(r, randomWait));
              }
            }
          }
        } catch (e) {
           console.log(`Qrupa göndərilərkən xəta:`, e.message);
        }
      }
      
      await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, Date.now());
    }

    if (user.autoReplyEnabled && user.autoReplyMessage) {
      if (!global.repliedMsgs) global.repliedMsgs = {}; 
      
      try {
        const pms = await client.getDialogs({ limit: 15 });
        for (const pm of pms) {
          if (pm.isUser && pm.entity && !pm.entity.bot && !pm.entity.isSelf && !pm.entity.self) {
             const history = await client.getMessages(pm.entity, { limit: 1 });
             if (history && history.length > 0 && !history[0].out) {
                const lastMsgId = history[0].id;
                const memKey = `${phone}_${pm.id}`;
                
                if (global.repliedMsgs[memKey] !== lastMsgId) {
                   try {
                     const inputPeer = await client.getInputEntity(pm.id);
                     
                     await client.invoke(new Api.messages.SetTyping({
                         peer: inputPeer,
                         action: new Api.SendMessageTypingAction()
                     }));
                     await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000));
                     
                     await client.sendMessage(inputPeer, { message: user.autoReplyMessage });
                     await client.invoke(new Api.messages.ReadHistory({
                       peer: inputPeer,
                       maxId: 0
                     }));
                     
                     global.repliedMsgs[memKey] = lastMsgId;
                   } catch (err) {}
                }
             }
          }
        }
      } catch (e) {}
    }

  } catch (e) {
     console.error('Proses task xətası:', e.message);
  } finally {
    if (client) try { await client.disconnect(); } catch (e) {}
  }
}

// ============ PENDING PHONE CHANGE ============
setInterval(async () => {
  try {
    const users = await getDB('users');
    if (!users) return;
    for (const chatId in users) {
      const user = users[chatId];
      if (user.pendingPhoneChange) {
        const newPhone = user.pendingPhoneChange.newPhone;
        const lang = user.lang || 'az';
        try {
          const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, { connectionRetries: 1 });
          await client.connect();
          const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, newPhone);
          userSessions[chatId] = { client, phone: newPhone, phoneCodeHash };
          await setDB(`users/${chatId}/currentPhoneSetup`, newPhone);
          await setDB(`users/${chatId}/state`, 'AWAITING_OTP');
          await setDB(`users/${chatId}/pendingPhoneChange`, null);
          bot.sendMessage(chatId, t('admin_phone_change_prompt', lang), {
            reply_markup: { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] }
          });
        } catch (e) {
          await setDB(`users/${chatId}/pendingPhoneChange`, null);
          bot.sendMessage(chatId, t('err', lang) + e.message);
        }
      }
    }
  } catch (e) {
    console.error('pendingPhoneChange xətası:', e);
  }
}, 15000);
