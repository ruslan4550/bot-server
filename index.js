const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fetch = require('node-fetch');
const http = require('http');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end("Bot işləyir."); }).listen(PORT, () => {
  console.log(`Health-check serveri ${PORT} portunda işə düşdü.`);
});

const BOT_TOKEN = "8940602664:AAHbe3HRkoselmfmUgmzvwWuJFfPkrCnKUg";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://newbot-db894-default-rtdb.europe-west1.firebasedatabase.app";

// Polling – stabil işləmə üçün restart aktiv
const bot = new TelegramBot(BOT_TOKEN);
bot.startPolling({ restart: true, params: { timeout: 10 } });

const userSessions = {};
const mainMessageIds = new Map();

console.log("EliteBot Serveri Başladı...");

// Polling xətalarını avtomatik bərpa
bot.on('polling_error', (error) => {
  console.error('Polling xətası:', error.message);
  if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
    console.log('409 Conflict – polling yenidən başladılır...');
    bot.stopPolling()
      .then(() => setTimeout(() => bot.startPolling({ restart: true }), 2000))
      .catch(() => setTimeout(() => bot.startPolling({ restart: true }), 2000));
  }
});

// ------------------------------------------------------------------
// Çoxdilli dəstək (AZ, TR, EN, RU – tam) – yalnız əlavə olunan açarlar göstərilib
// (Əvvəlki tam tərcümənizi eynilə saxlayın)
// ------------------------------------------------------------------
const i18n = {
    az: {
        sub_msg: "Aşağıdakı kanallara abunə olun:", sub_btn: "✅ Abunəlikləri Təsdiqlə", checking: "⏳ Abunəlik yoxlanılır...",
        confirmed: "✅ Təsdiqləndi!", not_subscribed: "❌ Siz hələ bütün kanallara abunə olmamısınız! Zəhmət olmasa əvvəlcə kanallara qoşulun və yenidən yoxlayın.",
        menu_unlic: "Zəhmət olmasa lisenziya aktivləşdirin:", btn_act_lic: "🔑 Lisenziya Aktivləşdir",
        btn_buy_lic: "🛒 Lisenziya Al / Dəstək", btn_price: "📋 Qiymət Cədvəli", btn_web: "🌐 Web Sitemiz",
        menu_lic: "✅ Lisenziya Aktivdir! Ana Menyu:", btn_add_num: "➕ Yeni Nömrə Əlavə Et", btn_manage: "⚙️ Hesablarım (Nömrələr)",
        enter_lic: "Lisenziya kodunu daxil edin (Məsələn: ELITE-12345):", invalid_lic: "❌ Keçərsiz lisenziya kodu formati.",
        not_found_lic: "❌ Belə bir lisenziya bazada mövcud deyil!", blocked_lic: "❌ Bu lisenziya bloklanıb!",
        used_lic: "❌ Bu lisenziya artıq başqa istifadəçi tərəfindən istifadə olunur!", success_lic: "✅ Lisenziya uğurla təsdiqləndi!",
        no_lic: "❌ Aktiv lisenziyanız yoxdur.", limit_reached: "❌ Lisenziya limitinizə çatdınız (Maksimum: {max} nömrə).",
        enter_phone: "📱 Bota qoşmaq istədiyiniz Telegram nömrənizi daxil edin (+ işarəsi ilə. Məs: +994501234567):",
        no_numbers: "⚠️ Hələ heç bir nömrə əlavə edilməyib.", my_accounts: "⚙️ *Aktiv Hesablarınız:*\n\n",
        stopped: "🔴 Dayandırılıb", active: "🟢 Aktiv", stop_btn: "Dayandır: +", resume_btn: "Başlat: +", back_main: "🔙 Ana Menyu",
        phone_format: "⚠️ Nömrə '+' ilə başlamalıdır!\n\nZəhmət olmasa düzgün formatda daxil edin.", otp_sent: "⏳ OTP kodu göndərilir, gözləyin...",
        otp_info: "📩 Təhlükəsizlik kodu göndərildi. Kodu aralarında boşluqla daxil edin (Məs: 8 8 9 9 0):\n\nNömrəni səhv daxil etmisinizsə, /changenumber yazın.",
        err: "❌ Xəta: ", sess_lost: "⚠️ Sessiya yaddaşdan silinib. Zəhmət olmasa prosesə yenidən başlayın.",
        login_success: "✅ {phone} hesabına uğurla giriş edildi!\n\nİndi mesajın göndəriləcəyi qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:",
        otp_err: "❌ OTP səhvdir və ya hesabda 2-Mərhələli təsdiqləmə (2FA) aktivdir. Xəta: ",
        group_added: "✅ Qrup əlavə olundu. (Hazırda bu nömrə üçün {count} qrup var)\n\nBaşqa qrup əlavə etmək istəyirsiniz, yoxsa davam edək?",
        add_more: "➕ Başqa qrup əlavə et", finish_btn: "✅ Bitir və Davam Et", send_group: "Əlavə etmək istədiyiniz qrupun *istifadəçi adını* və ya *linkini* göndərin:",
        ask_interval: "✅ Qruplar təsdiqləndi. İndi mesajın neçə dəqiqədən bir atılacağını rəqəmlə yazın (Yalnız 2 - 5 arası):",
        interval_err: "⚠️ Zəhmət olmasa 2 ilə 5 arası bir rəqəm yazın.",
        bot_started: "✅ *Bot İşə Düşdü ({phone})!*\n\nBot hər {min} dəqiqədən bir seçilən mənbədən mesajları hədəf qruplara atacaq.",
        ch1_btn: "📢 Məcburi Kanal 1", ch2_btn: "📢 Məcburi Kanal 2", all_stopped: "⏹ Bütün hesablar dayandırıldı.", stop_single: "⏹ +{phone} üçün göndərim dayandırıldı.",
        resume_single: "▶️ +{phone} yenidən işə düşdü.", enter_again: "🔄 Telefon nömrənizi yenidən daxil edin (+ işarəsi ilə):",
        source_prompt: "📥 Mesajlar haradan götürülsün?",
        source_saved_btn: "💾 Yadda saxlanmış mesajlar",
        source_custom_btn: "🔗 Xüsusi Kanal/Qrup/Bot",
        enter_source: "📢 Mesajın götürüləcəyi kanal/qrup/botun istifadəçi adını (@) və ya linkini göndərin:",
        invalid_source: "❌ Daxil etdiyiniz mənbəyə giriş mümkün olmadı. Zəhmət olmasa düzgün istifadəçi adı/link göndərin.",
        source_set_saved: "✅ Mənbə: Yadda saxlanmış mesajlar.",
        source_set_custom: "✅ Mənbə təyin olundu: {target}",
        cancel_btn: "❌ Ləğv et",
        groups_btn: "📋 Qrupları İdarə Et",
        source_btn: "📥 Mənbəni İdarə Et",
        delete_btn: "🗑 Nömrəni Sil",
        back_btn: "🔙 Geri",
        del_group_btn: "❌ Sil: {group}",
        del_source_btn: "❌ Mənbəni sil (Yadda saxlanmış mesajlara qaytar)",
        no_groups: "❌ Heç bir qrup əlavə edilməyib.",
        confirm_delete_num: "❗️ +{phone} nömrəsini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz!",
        confirm_delete_num_yes: "✅ Bəli, sil",
        confirm_delete_num_no: "❌ Xeyr",
        num_deleted: "✅ +{phone} nömrəsi sistemdən silindi.",
        group_deleted: "✅ Qrup silindi.",
        source_deleted: "✅ Mənbə silindi, artıq yadda saxlanmış mesajlardan istifadə ediləcək.",
        add_group_btn: "➕ Yeni Qrup Əlavə Et",
        change_source_btn: "🔄 Mənbəni Dəyiş",
        change_interval_btn: "⏱ İntervalı Dəyiş",
        admin_phone_change_prompt: "🔔 Admin tərəfindən nömrəniz dəyişdirildi. Yeni nömrəyə göndərilən OTP kodu daxil edin:",
        auto_reply_set: "✅ Avtomatik cavab mesajınız təyin olundu. İndi sizə yazılan istənilən mesaja bu mətn avtomatik göndəriləcək.",
        auto_reply_deleted: "✅ Avtomatik cavab mesajı silindi.",
        auto_reply_btn: "📩 Avtomatik Cavab",
        set_auto_reply: "📩 Avtomatik cavab mesajınızı daxil edin (Ləğv etmək üçün /cancel yazın):",
        phone_format_back_btn: "🔙 Ana Menyuya qayıt",
        scan_btn: "🔍 Qrup Skanı",
        scanning: "⏳ Qruplar skan edilir...",
        select_groups: "📋 Aşağıdakı qruplardan seçim edin. Seçilmişlər: {count}",
        scan_select: "✅ Seç",
        scan_unselect: "❌ Sil",
        scan_confirm: "✅ Seçilmişləri əlavə et",
        scan_more: "⏭ Növbəti səhifə",
        scan_back: "⏮ Əvvəlki səhifə",
        scan_done: "✅ Seçilmiş {count} qrup hədəf siyahısına əlavə edildi.",
        no_groups_found: "❌ Bu hesabın üzv olduğu heç bir qrup tapılmadı.",
        scan_page: "Səhifə {page}/{total}",
        new_interval_prompt: "⏱ Yeni intervalı daxil edin (2-5 dəqiqə):",
        interval_updated: "✅ İnterval {min} dəqiqəyə dəyişdirildi.",
    },
    tr: { /* eyni açarlar */ },
    en: { /* eyni açarlar */ },
    ru: { /* eyni açarlar */ }
};

function t(key, lang = 'az', params = {}) {
    let text = i18n[lang]?.[key] || i18n['az'][key] || key;
    for (const [k, v] of Object.entries(params)) { text = text.replace(`{${k}}`, v); }
    return text;
}

// Firebase
async function getDB(path) {
  try { const res = await fetch(`${FIREBASE_URL}/${path}.json`); return await res.json(); } catch (e) { return null; }
}
async function setDB(path, data) {
  try { await fetch(`${FIREBASE_URL}/${path}.json`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (e) { console.error(e); }
}

// Bot profil ayarları (səssiz xəta idarəsi)
let currentDesc = "", currentShortDesc = "", lastProfilePhoto = null;
setInterval(async () => {
    const settings = await getDB('settings');
    if (settings) {
        if (settings.botDescription && settings.botDescription !== currentDesc) {
            currentDesc = settings.botDescription;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ description: settings.botDescription || "" })
            }).catch(() => {});
        }
        if (settings.botShortDescription && settings.botShortDescription !== currentShortDesc) {
            currentShortDesc = settings.botShortDescription;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyShortDescription`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ short_description: settings.botShortDescription || "" })
            }).catch(() => {});
        }
        if (settings.botProfilePhoto && settings.botProfilePhoto !== lastProfilePhoto) {
            lastProfilePhoto = settings.botProfilePhoto;
            try {
                const botInfo = await bot.getMe();
                await bot.setChatPhoto(botInfo.id, settings.botProfilePhoto);
            } catch (e) { /* şəkil yenilənə bilmədi */ }
        }
    }
}, 15000);

async function isSubscribed(userId, settings) {
  const channelIds = [settings.channel1_id, settings.channel2_id].filter(id => id && String(id).trim() !== "");
  if (channelIds.length === 0) return true;
  for (const chId of channelIds) {
    try {
      const member = await bot.getChatMember(chId.trim(), userId);
      if (!["member", "administrator", "creator"].includes(member.status)) return false;
    } catch (err) {
      console.error(`Abunəlik yoxlanışı xətası (${chId}):`, err.message);
      return false;
    }
  }
  return true;
}

async function resolveTargetEntity(client, rawTarget) {
  let g = String(rawTarget).trim();
  if (g.startsWith("chat:")) {
    const chatId = g.slice(5);
    return parseInt(chatId);
  }
  g = g.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '');
  let inviteHash = null;
  if (g.startsWith('+')) inviteHash = g.slice(1);
  else if (g.startsWith('joinchat/')) inviteHash = g.slice('joinchat/'.length);
  if (inviteHash) {
    try {
      const result = await client.invoke(new Api.messages.ImportChatInvite({ hash: inviteHash }));
      if (result.chats && result.chats.length > 0) return result.chats[0];
    } catch (err) {
      if (err.message && err.message.includes("USER_ALREADY_PARTICIPANT")) {
        const info = await client.invoke(new Api.messages.CheckChatInvite({ hash: inviteHash }));
        if (info.chat) return info.chat;
        if (info.chats && info.chats.length > 0) return info.chats[0];
      } else throw err;
    }
  }
  return g;
}

async function getForwardTargetEntity(client, targetStr) {
  const resolved = await resolveTargetEntity(client, targetStr);
  if (typeof resolved === 'number' || (typeof resolved === 'object' && resolved.id)) {
    // entity obyekti olduğu halda da qaytara bilərik
    return resolved;
  }
  return await client.getInputEntity(resolved);
}

async function sendOrUpdateScreen(chatId, text, options = {}) {
    try {
        const msgId = mainMessageIds.get(chatId);
        if (msgId) {
            await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, ...options });
            return;
        }
    } catch (e) {}
    const sent = await bot.sendMessage(chatId, text, options);
    mainMessageIds.set(chatId, sent.message_id);
}

async function showMainMenu(chatId, lang) {
    const user = await getDB(`users/${chatId}`) || {};
    const settings = await getDB('settings') || {};
    const inline_keyboard = [];

    let hasValidLicense = false;
    if (user.activeLicense) {
        const lic = await getDB(`licenses/${user.activeLicense}`);
        hasValidLicense = !!(lic && lic.active);
    }

    if (!hasValidLicense) {
        inline_keyboard.push([{ text: t('btn_act_lic', lang), callback_data: "enter_license" }]);
    } else {
        inline_keyboard.push([{ text: t('btn_add_num', lang), callback_data: "add_new_number" }]);
        inline_keyboard.push([{ text: t('btn_manage', lang), callback_data: "manage_numbers" }]);
        inline_keyboard.push([{ text: t('auto_reply_btn', lang), callback_data: "auto_reply" }]);
    }
    inline_keyboard.push([{ text: t('btn_buy_lic', lang), url: settings.support || "https://t.me/EliteNetworkk" }]);
    inline_keyboard.push([{ text: t('btn_web', lang), url: settings.website || "https://t.me/EliteBotMedia" }]);

    await sendOrUpdateScreen(chatId, hasValidLicense ? t('menu_lic', lang) : t('menu_unlic', lang), { reply_markup: { inline_keyboard } });
}

// /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  mainMessageIds.delete(chatId);
  await setDB(`users/${chatId}/state`, "START");

  const settings = await getDB('settings') || {};
  if (settings.startPhotoUrl) {
    try { await bot.sendPhoto(chatId, settings.startPhotoUrl); } catch(e) {}
  }

  const keyboard = {
    inline_keyboard: [
      [{ text: "🇦🇿 Azərbaycan", callback_data: "lang_az" }, { text: "🇹🇷 Türkçe", callback_data: "lang_tr" }],
      [{ text: "🇬🇧 English", callback_data: "lang_en" }, { text: "🇷🇺 Русский", callback_data: "lang_ru" }]
    ]
  };
  const sent = await bot.sendMessage(chatId, "Dil seçin / Seçim yapın / Select / Выберите:", { reply_markup: keyboard });
  mainMessageIds.set(chatId, sent.message_id);
});

// ------------------------------------------------------------------
// Bütün callback sorğuları
// ------------------------------------------------------------------
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";
  await bot.answerCallbackQuery(query.id);

  if (data === "cancel_operation") {
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, "IDLE");
    return showMainMenu(chatId, userLang);
  }

  if (data.startsWith("lang_")) {
    const lang = data.split("_")[1];
    await setDB(`users/${chatId}/lang`, lang);
    const settings = await getDB('settings') || {};
    const ch1 = settings.channel1 || "https://t.me/+-60Ix6CPm0lmMDQ6";
    const ch2 = settings.channel2 || "https://t.me/+SX-UgXay5hEzOGYy";
    const keyboard = {
      inline_keyboard: [
        [{ text: t('ch1_btn', lang), url: ch1 }],
        [{ text: t('ch2_btn', lang), url: ch2 }],
        [{ text: t('sub_btn', lang), callback_data: "check_subscription" }],
        [{ text: t('back_main', lang), callback_data: "back_to_main" }]
      ]
    };
    await sendOrUpdateScreen(chatId, t('sub_msg', lang), { reply_markup: keyboard });
    return;
  }

  if (data === "check_subscription") {
    const waitMsg = await bot.sendMessage(chatId, t('checking', userLang));
    const settings = await getDB('settings') || {};
    const subscribed = await isSubscribed(query.from.id, settings);
    await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
    if (subscribed) {
      return showMainMenu(chatId, userLang);
    } else {
      const ch1 = settings.channel1 || "https://t.me/+-60Ix6CPm0lmMDQ6";
      const ch2 = settings.channel2 || "https://t.me/+SX-UgXay5hEzOGYy";
      const keyboard = {
        inline_keyboard: [
          [{ text: t('ch1_btn', userLang), url: ch1 }],
          [{ text: t('ch2_btn', userLang), url: ch2 }],
          [{ text: t('sub_btn', userLang), callback_data: "check_subscription" }],
          [{ text: t('back_main', userLang), callback_data: "back_to_main" }]
        ]
      };
      await sendOrUpdateScreen(chatId, t('not_subscribed', userLang), { reply_markup: keyboard });
      return;
    }
  }

  if (data === "enter_license") {
    await setDB(`users/${chatId}/state`, "AWAITING_LICENSE");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
    return sendOrUpdateScreen(chatId, t('enter_lic', userLang), { reply_markup: keyboard });
  }

  if (data === "add_new_number") {
      const user = await getDB(`users/${chatId}`);
      if (!user.activeLicense) return bot.sendMessage(chatId, t('no_lic', userLang));
      const lic = await getDB(`licenses/${user.activeLicense}`);
      if (!lic || !lic.active) return bot.sendMessage(chatId, t('blocked_lic', userLang));
      const accountsCount = user.accounts ? Object.keys(user.accounts).length : 0;
      if (accountsCount >= lic.maxAccounts) {
         return bot.sendMessage(chatId, t('limit_reached', userLang, { max: lic.maxAccounts }));
      }
      await setDB(`users/${chatId}/state`, "AWAITING_PHONE");
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
      return sendOrUpdateScreen(chatId, t('enter_phone', userLang), { reply_markup: keyboard });
  }

  if (data === "manage_numbers") {
      const user = await getDB(`users/${chatId}`);
      if (!user || !user.accounts) return bot.sendMessage(chatId, t('no_numbers', userLang));
      let msg = t('my_accounts', userLang);
      const inline_keyboard = [];
      for (const phone in user.accounts) {
          const acc = user.accounts[phone];
          const status = acc.status === "ACTIVE" ? t('active', userLang) : t('stopped', userLang);
          const sourceType = acc.messageSource?.type === "custom" ? `📌 ${acc.messageSource.target || "?"}` : "💾 Kaydedilmiş";
          msg += `📱 +${phone}\n⏳ İnterval: ${acc.intervalMinutes || 0} dəq\n📥 Mənbə: ${sourceType}\n📊 ${status}\n\n`;

          inline_keyboard.push([
            { text: t('groups_btn', userLang), callback_data: `groups_${phone}` },
            { text: t('source_btn', userLang), callback_data: `source_${phone}` }
          ]);
          inline_keyboard.push([
            { text: t('change_interval_btn', userLang), callback_data: `chint_${phone}` }
          ]);
          inline_keyboard.push([
            { text: (acc.status === "ACTIVE" ? t('stop_btn', userLang) : t('resume_btn', userLang)) + phone, callback_data: `toggle_${phone}` },
            { text: t('delete_btn', userLang), callback_data: `delete_${phone}` }
          ]);
          inline_keyboard.push([{ text: t('scan_btn', userLang), callback_data: `scan_${phone}` }]);
      }
      inline_keyboard.push([{ text: t('back_main', userLang), callback_data: "back_to_main" }]);
      return sendOrUpdateScreen(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  if (data === "auto_reply") {
    await setDB(`users/${chatId}/state`, "AWAITING_AUTO_REPLY");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
    return sendOrUpdateScreen(chatId, t('set_auto_reply', userLang), { reply_markup: keyboard });
  }

  if (data.startsWith("toggle_")) {
      const phoneKey = data.replace("toggle_", "");
      const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
      if (acc) {
        const newStatus = acc.status === "ACTIVE" ? "STOPPED" : "ACTIVE";
        await setDB(`users/${chatId}/accounts/${phoneKey}/status`, newStatus);
        bot.sendMessage(chatId, newStatus === "STOPPED" ? t('stop_single', userLang, { phone: phoneKey }) : t('resume_single', userLang, { phone: phoneKey }));
        return bot.emit('callback_query', { message: query.message, data: 'manage_numbers', id: query.id, from: query.from });
      }
      return showMainMenu(chatId, userLang);
  }

  // Interval dəyişmə (yeni)
  if (data.startsWith("chint_")) {
      const phoneKey = data.replace("chint_", "");
      await setDB(`users/${chatId}/state`, "AWAITING_CHANGE_INTERVAL");
      await setDB(`users/${chatId}/changingIntervalPhone`, phoneKey);
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_btn', userLang), callback_data: "manage_numbers" }]] };
      return sendOrUpdateScreen(chatId, t('new_interval_prompt', userLang), { reply_markup: keyboard });
  }

  // Qrup Skanı
  if (data.startsWith("scan_")) {
    const phoneKey = data.replace("scan_", "");
    const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
    if (!acc || !acc.telegramSession) return bot.sendMessage(chatId, t('no_numbers', userLang));

    const waitMsg = await bot.sendMessage(chatId, t('scanning', userLang));
    let client;
    try {
      client = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
      await client.connect();
      const dialogs = await client.getDialogs({ limit: 200 });
      const groups = dialogs.filter(d => d.isGroup || d.isChannel).map(d => ({
        id: d.id,
        title: d.title || 'Bilinməyən',
        username: d.username || '',
      }));

      if (groups.length === 0) {
        await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
        return bot.sendMessage(chatId, t('no_groups_found', userLang));
      }

      userSessions[chatId] = userSessions[chatId] || {};
      userSessions[chatId].scanGroups = groups;
      userSessions[chatId].scanSelected = new Set();
      userSessions[chatId].scanPage = 0;
      userSessions[chatId].scanPhoneKey = phoneKey;

      await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
      return sendScanPage(chatId, userLang);
    } catch (err) {
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
      bot.sendMessage(chatId, t('err', userLang) + err.message);
    } finally {
      if (client) { try { await client.disconnect(); } catch (e) {} }
    }
    return;
  }

  if (data.startsWith("scanselect_")) {
    const groupIndex = parseInt(data.split("_")[1]);
    const session = userSessions[chatId];
    if (!session || !session.scanGroups) return;
    if (session.scanSelected.has(groupIndex)) {
      session.scanSelected.delete(groupIndex);
    } else {
      session.scanSelected.add(groupIndex);
    }
    return sendScanPage(chatId, userLang);
  }

  if (data === "scan_confirm") {
    const session = userSessions[chatId];
    if (!session) return;
    const phoneKey = session.scanPhoneKey;
    const selectedGroups = Array.from(session.scanSelected).map(i => {
      const g = session.scanGroups[i];
      return g.username ? `@${g.username}` : `chat:${g.id}`;
    });
    const existing = (await getDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`)) || [];
    const merged = [...new Set([...existing, ...selectedGroups])];
    await setDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`, merged);
    delete userSessions[chatId].scanGroups;
    delete userSessions[chatId].scanSelected;
    bot.sendMessage(chatId, t('scan_done', userLang, { count: selectedGroups.length }));
    return bot.emit('callback_query', { message: query.message, data: `manage_numbers`, id: query.id, from: query.from });
  }

  if (data === "scan_more") {
    if (!userSessions[chatId]) return;
    userSessions[chatId].scanPage++;
    return sendScanPage(chatId, userLang);
  }

  if (data === "scan_back") {
    if (!userSessions[chatId]) return;
    userSessions[chatId].scanPage--;
    return sendScanPage(chatId, userLang);
  }

  // Qrupları göstər (mövcud)
  if (data.startsWith("groups_")) {
      const phoneKey = data.replace("groups_", "");
      const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
      if (!acc) return bot.sendMessage(chatId, t('no_numbers', userLang));
      const groups = acc.targetGroups || [];
      let msg = `📱 *+${phoneKey}* üçün hədəf qruplar:\n\n`;
      const inline_keyboard = [];
      if (groups.length === 0) {
          msg += t('no_groups', userLang);
      } else {
          groups.forEach((g, i) => {
              msg += `${i+1}. ${g}\n`;
              inline_keyboard.push([{ text: t('del_group_btn', userLang, { group: g.substring(0,20) }), callback_data: `delgroup_${phoneKey}_${i}` }]);
          });
      }
      inline_keyboard.push([{ text: t('add_group_btn', userLang), callback_data: `addgroup_${phoneKey}` }]);
      inline_keyboard.push([{ text: t('back_btn', userLang), callback_data: "manage_numbers" }]);
      inline_keyboard.push([{ text: t('back_main', userLang), callback_data: "back_to_main" }]);
      return sendOrUpdateScreen(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  if (data.startsWith("delgroup_")) {
      const parts = data.split("_");
      const phoneKey = parts[1];
      const idx = parseInt(parts[2]);
      const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
      if (!acc || !acc.targetGroups) return;
      acc.targetGroups.splice(idx, 1);
      await setDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`, acc.targetGroups);
      bot.sendMessage(chatId, t('group_deleted', userLang));
      return bot.emit('callback_query', { message: query.message, data: `groups_${phoneKey}`, id: query.id, from: query.from });
  }

  if (data.startsWith("addgroup_")) {
      const phoneKey = data.replace("addgroup_", "");
      await setDB(`users/${chatId}/currentPhoneSetup`, "+" + phoneKey);
      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_btn', userLang), callback_data: `groups_${phoneKey}` }]] };
      return sendOrUpdateScreen(chatId, t('send_group', userLang), { parse_mode: "Markdown", reply_markup: keyboard });
  }

  // Mənbə idarəetmə
  if (data.startsWith("source_")) {
      const phoneKey = data.replace("source_", "");
      const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
      if (!acc) return;
      const source = acc.messageSource;
      let msg = `📥 *+${phoneKey}* mesaj mənbəyi:\n\n`;
      const inline_keyboard = [];
      if (!source || source.type === "saved") {
          msg += "💾 Yadda saxlanmış mesajlar";
      } else {
          msg += `🔗 Xüsusi mənbə: ${source.target}`;
      }
      inline_keyboard.push([{ text: t('del_source_btn', userLang), callback_data: `delsource_${phoneKey}` }]);
      inline_keyboard.push([{ text: t('change_source_btn', userLang), callback_data: `changesource_${phoneKey}` }]);
      inline_keyboard.push([{ text: t('back_btn', userLang), callback_data: "manage_numbers" }]);
      inline_keyboard.push([{ text: t('back_main', userLang), callback_data: "back_to_main" }]);
      return sendOrUpdateScreen(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  if (data.startsWith("delsource_")) {
      const phoneKey = data.replace("delsource_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}/messageSource`, { type: "saved" });
      bot.sendMessage(chatId, t('source_deleted', userLang));
      return bot.emit('callback_query', { message: query.message, data: `source_${phoneKey}`, id: query.id, from: query.from });
  }

  if (data.startsWith("changesource_")) {
      const phoneKey = data.replace("changesource_", "");
      await setDB(`users/${chatId}/currentPhoneSetup`, "+" + phoneKey);
      await setDB(`users/${chatId}/state`, "AWAITING_CUSTOM_SOURCE");
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_btn', userLang), callback_data: "manage_numbers" }]] };
      return sendOrUpdateScreen(chatId, t('enter_source', userLang), { reply_markup: keyboard });
  }

  if (data.startsWith("delete_")) {
      const phoneKey = data.replace("delete_", "");
      const keyboard = {
        inline_keyboard: [
          [{ text: t('confirm_delete_num_yes', userLang), callback_data: `confirm_delete_${phoneKey}` }],
          [{ text: t('confirm_delete_num_no', userLang), callback_data: "manage_numbers" }],
          [{ text: t('back_main', userLang), callback_data: "back_to_main" }]
        ]
      };
      return sendOrUpdateScreen(chatId, t('confirm_delete_num', userLang, { phone: phoneKey }), { reply_markup: keyboard });
  }

  if (data.startsWith("confirm_delete_")) {
      const phoneKey = data.replace("confirm_delete_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}`, null);
      const user = await getDB(`users/${chatId}`);
      if (user && user.activeLicense) {
        await setDB(`licenses/${user.activeLicense}/registeredPhones/${phoneKey}`, null);
      }
      bot.sendMessage(chatId, t('num_deleted', userLang, { phone: phoneKey }));
      delete userSessions[chatId];
      await setDB(`users/${chatId}/state`, "IDLE");
      return showMainMenu(chatId, userLang);
  }

  if (data === "back_to_main") {
    await setDB(`users/${chatId}/state`, "IDLE");
    delete userSessions[chatId];
    return showMainMenu(chatId, userLang);
  }

  if (data === "delete_auto_reply") {
    await setDB(`users/${chatId}/autoReplyMessage`, null);
    bot.sendMessage(chatId, t('auto_reply_deleted', userLang));
    return showMainMenu(chatId, userLang);
  }

  if (data === "add_more_group") {
    await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
    return sendOrUpdateScreen(chatId, t('send_group', userLang), { parse_mode: "Markdown", reply_markup: keyboard });
  }

  if (data === "finish_groups") {
    await setDB(`users/${chatId}/state`, "AWAITING_SOURCE");
    const keyboard = {
      inline_keyboard: [
        [{ text: t('source_saved_btn', userLang), callback_data: "source_saved" }],
        [{ text: t('source_custom_btn', userLang), callback_data: "source_custom" }],
        [{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }],
        [{ text: t('back_main', userLang), callback_data: "back_to_main" }]
      ]
    };
    return sendOrUpdateScreen(chatId, t('source_prompt', userLang), { reply_markup: keyboard });
  }

  if (data === "source_saved") {
    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');
    await setDB(`users/${chatId}/accounts/${phoneKey}/messageSource`, { type: "saved" });
    await setDB(`users/${chatId}/state`, "AWAITING_INTERVAL");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
    return sendOrUpdateScreen(chatId, t('ask_interval', userLang), { reply_markup: keyboard });
  }

  if (data === "source_custom") {
    await setDB(`users/${chatId}/state`, "AWAITING_CUSTOM_SOURCE");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
    return sendOrUpdateScreen(chatId, t('enter_source', userLang), { reply_markup: keyboard });
  }
});

// Skan səhifəsini göstərən funksiya
async function sendScanPage(chatId, lang) {
  const session = userSessions[chatId];
  if (!session || !session.scanGroups) return;
  const perPage = 5;
  const totalPages = Math.ceil(session.scanGroups.length / perPage);
  let page = session.scanPage;
  if (page >= totalPages) page = totalPages - 1;
  if (page < 0) page = 0;
  session.scanPage = page;

  const start = page * perPage;
  const slice = session.scanGroups.slice(start, start + perPage);
  let text = t('select_groups', lang, { count: session.scanSelected.size }) + "\n\n";
  text += `📖 ${t('scan_page', lang, { page: page + 1, total: totalPages })}\n\n`;

  const keyboard = { inline_keyboard: [] };
  slice.forEach((g, i) => {
    const idx = start + i;
    const selected = session.scanSelected.has(idx);
    const emoji = selected ? "✅" : "⬜";
    const btnText = `${emoji} ${g.title.substring(0, 25)}`;
    keyboard.inline_keyboard.push([{ text: btnText, callback_data: `scanselect_${idx}` }]);
  });

  const navRow = [];
  if (page > 0) navRow.push({ text: t('scan_back', lang), callback_data: "scan_back" });
  if (page < totalPages - 1) navRow.push({ text: t('scan_more', lang), callback_data: "scan_more" });
  if (navRow.length) keyboard.inline_keyboard.push(navRow);

  keyboard.inline_keyboard.push([{ text: t('scan_confirm', lang), callback_data: "scan_confirm" }]);
  keyboard.inline_keyboard.push([{ text: t('back_btn', lang), callback_data: `manage_numbers` }]);

  await sendOrUpdateScreen(chatId, text, { reply_markup: keyboard });
}

// ------------------------------------------------------------------
// Mesaj işləyicisi
// ------------------------------------------------------------------
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const user = await getDB(`users/${chatId}`);
    const lang = user?.lang || "az";
    const state = await getDB(`users/${chatId}/state`);
    if ((!state || state === "IDLE") && user?.autoReplyMessage) {
      bot.sendMessage(chatId, user.autoReplyMessage);
    }
    return;
  }

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";
  const state = await getDB(`users/${chatId}/state`);

  if (text === t('cancel_btn', userLang)) {
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, "IDLE");
    return showMainMenu(chatId, userLang);
  }

  if (state === "AWAITING_CHANGE_INTERVAL") {
    const min = parseInt(text);
    if (isNaN(min) || min < 2 || min > 5) return bot.sendMessage(chatId, t('interval_err', userLang));
    const phoneKey = await getDB(`users/${chatId}/changingIntervalPhone`);
    if (!phoneKey) return showMainMenu(chatId, userLang);
    await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, min);
    await setDB(`users/${chatId}/state`, "IDLE");
    await setDB(`users/${chatId}/changingIntervalPhone`, null);
    bot.sendMessage(chatId, t('interval_updated', userLang, { min }));
    return showMainMenu(chatId, userLang);
  }

  if (state === "AWAITING_AUTO_REPLY") {
    await setDB(`users/${chatId}/autoReplyMessage`, text);
    await setDB(`users/${chatId}/state`, "IDLE");
    bot.sendMessage(chatId, t('auto_reply_set', userLang));
    return showMainMenu(chatId, userLang);
  }

  if (state === "AWAITING_LICENSE") {
    if (!text.startsWith("ELITE-")) return bot.sendMessage(chatId, t('invalid_lic', userLang));
    const lic = await getDB(`licenses/${text}`);
    if (!lic) return bot.sendMessage(chatId, t('not_found_lic', userLang));
    if (!lic.active) return bot.sendMessage(chatId, t('blocked_lic', userLang));
    if (lic.usedBy && lic.usedBy !== chatId) return bot.sendMessage(chatId, t('used_lic', userLang));
    if (!lic.usedBy) await setDB(`licenses/${text}/usedBy`, chatId);
    await setDB(`users/${chatId}/activeLicense`, text);
    await setDB(`users/${chatId}/state`, "IDLE");
    return showMainMenu(chatId, userLang);
  }

  if (state === "AWAITING_PHONE") {
    if (!text.startsWith("+")) {
      const keyboard = {
        inline_keyboard: [[{ text: t('phone_format_back_btn', userLang), callback_data: "back_to_main" }]]
      };
      return sendOrUpdateScreen(chatId, t('phone_format', userLang), { reply_markup: keyboard });
    }
    const waitMsg = await bot.sendMessage(chatId, t('otp_sent', userLang));
    try {
      const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 5 });
      await client.connect();
      const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, text);
      userSessions[chatId] = { client, phone: text, phoneCodeHash };
      await setDB(`users/${chatId}/currentPhoneSetup`, text);
      await setDB(`users/${chatId}/state`, "AWAITING_OTP");
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
      return sendOrUpdateScreen(chatId, t('otp_info', userLang), { reply_markup: keyboard });
    } catch (err) {
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
      bot.sendMessage(chatId, t('err', userLang) + err.message);
    }
    return;
  }

  if (state === "AWAITING_OTP") {
    const rawOtp = text.replace(/\s+/g, '');
    const sessionData = userSessions[chatId];
    if (!sessionData) return bot.sendMessage(chatId, t('sess_lost', userLang));
    try {
      await sessionData.client.invoke(new Api.auth.SignIn({
        phoneNumber: sessionData.phone,
        phoneCodeHash: sessionData.phoneCodeHash,
        phoneCode: rawOtp
      }));
      const savedSession = sessionData.client.session.save();
      const phoneKey = sessionData.phone.replace('+', '');
      await setDB(`users/${chatId}/accounts/${phoneKey}/telegramSession`, savedSession);
      await setDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`, []);
      const user = await getDB(`users/${chatId}`);
      if (user && user.activeLicense) {
        await setDB(`licenses/${user.activeLicense}/registeredPhones/${phoneKey}`, true);
      }
      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
      return sendOrUpdateScreen(chatId, t('login_success', userLang, { phone: sessionData.phone }), { parse_mode: "Markdown", reply_markup: keyboard });
    } catch (err) {
      bot.sendMessage(chatId, t('otp_err', userLang) + err.message);
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
        [{ text: t('add_more', userLang), callback_data: "add_more_group" }],
        [{ text: t('finish_btn', userLang), callback_data: "finish_groups" }],
        [{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }],
        [{ text: t('back_main', userLang), callback_data: "back_to_main" }]
      ]
    };
    return sendOrUpdateScreen(chatId, t('group_added', userLang, { count: existing.length }), { reply_markup: keyboard });
  }

  if (state === "AWAITING_CUSTOM_SOURCE") {
    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');
    const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
    if (!acc || !acc.telegramSession) return bot.sendMessage(chatId, t('sess_lost', userLang));
    let tempClient;
    try {
      tempClient = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
      await tempClient.connect();
      const sourceEntity = await resolveTargetEntity(tempClient, text);
      await tempClient.getMessages(sourceEntity, { limit: 1 });
    } catch (err) {
      if (tempClient) { try { await tempClient.disconnect(); } catch (e) {} }
      return bot.sendMessage(chatId, t('invalid_source', userLang));
    } finally {
      if (tempClient) { try { await tempClient.disconnect(); } catch (e) {} }
    }
    await setDB(`users/${chatId}/accounts/${phoneKey}/messageSource`, { type: "custom", target: text });
    await setDB(`users/${chatId}/state`, "AWAITING_INTERVAL");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
    return sendOrUpdateScreen(chatId, t('ask_interval', userLang), { reply_markup: keyboard });
  }

  if (state === "AWAITING_INTERVAL") {
    const min = parseInt(text);
    if (isNaN(min) || min < 2 || min > 5) return bot.sendMessage(chatId, t('interval_err', userLang));
    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');
    await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, min);
    await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, 0);
    await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "ACTIVE");
    await setDB(`users/${chatId}/state`, "IDLE");
    delete userSessions[chatId];
    return sendOrUpdateScreen(chatId, t('bot_started', userLang, { phone: currentPhone, min: min }), { parse_mode: "Markdown" });
  }

  const user = await getDB(`users/${chatId}`);
  if (user?.autoReplyMessage && (!state || state === "IDLE")) {
    bot.sendMessage(chatId, user.autoReplyMessage);
  }
});

// Admin nömrə dəyişikliyi
setInterval(async () => {
  const users = await getDB("users");
  if (!users) return;
  for (const chatId in users) {
    const user = users[chatId];
    if (user.pendingPhoneChange) {
      const newPhone = user.pendingPhoneChange.newPhone;
      const lang = user.lang || "az";
      try {
        const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 3 });
        await client.connect();
        const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, newPhone);
        userSessions[chatId] = { client, phone: newPhone, phoneCodeHash };
        await setDB(`users/${chatId}/currentPhoneSetup`, newPhone);
        await setDB(`users/${chatId}/state`, "AWAITING_OTP");
        await setDB(`users/${chatId}/pendingPhoneChange`, null);
        bot.sendMessage(chatId, t('admin_phone_change_prompt', lang), {
          reply_markup: { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: "cancel_operation" }]] }
        });
      } catch (e) {
        await setDB(`users/${chatId}/pendingPhoneChange`, null);
        bot.sendMessage(chatId, t('err', lang) + e.message);
      }
    }
  }
}, 15000);

// Avtomatik göndərim (təsadüfi 2‑4 dəqiqə arası gecikmə ilə, interval 60 saniyə yoxlama)
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
          const source = acc.messageSource || { type: "saved" };
          let sourceMessages;
          if (source.type === "custom" && source.target) {
            const sourceEntity = await resolveTargetEntity(client, source.target);
            sourceMessages = await client.getMessages(sourceEntity, { limit: 1 });
          } else {
            sourceMessages = await client.getMessages('me', { limit: 1 });
          }

          if (sourceMessages && sourceMessages.length > 0) {
            const msgToForward = sourceMessages[0];
            for (const g of groups) {
              try {
                const targetEntity = await getForwardTargetEntity(client, g);
                await client.forwardMessages(targetEntity, { messages: [msgToForward.id], fromPeer: msgToForward.peerId });
                // 2 ilə 4 dəqiqə arası təsadüfi gözləmə
                const delay = Math.floor(Math.random() * (4 - 2 + 1) + 2) * 60 * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
              } catch (e) { console.error(`(${phoneKey}) -> ${g} XƏTA:`, e.message); }
            }
            await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, Date.now());
          }
        } catch (err) {
          console.error(`(${phoneKey}) xəta:`, err.message);
        } finally {
          if (client) { try { await client.disconnect(); } catch (e) {} }
        }
    }
  }
}, 60000);