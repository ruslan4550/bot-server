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

// ÇOXDİLLİLİK (Multi-Language) Lüğəti
const i18n = {
    az: {
        sub_msg: "Aşağıdakı kanallara abunə olun:", sub_btn: "✅ Abunəlikləri Təsdiqlə", checking: "⏳ Abunəlik yoxlanılır...",
        confirmed: "✅ Təsdiqləndi!", menu_unlic: "Zəhmət olmasa lisenziya aktivləşdirin:", btn_act_lic: "🔑 Lisenziya Aktivləşdir",
        btn_buy_lic: "🛒 Lisenziya Al / Dəstək", btn_price: "📋 Qiymət Cədvəli", btn_web: "🌐 Web Sitemiz",
        menu_lic: "✅ Lisenziya Aktivdir! Ana Menyu:", btn_add_num: "➕ Yeni Nömrə Əlavə Et", btn_manage: "⚙️ Hesablarım (Nömrələr)",
        enter_lic: "Lisenziya kodunu daxil edin (Məsələn: ELITE-12345):", invalid_lic: "❌ Keçərsiz lisenziya kodu formati.",
        not_found_lic: "❌ Belə bir lisenziya bazada mövcud deyil!", blocked_lic: "❌ Bu lisenziya bloklanıb!",
        used_lic: "❌ Bu lisenziya artıq başqa istifadəçi tərəfindən istifadə olunur!", success_lic: "✅ Lisenziya uğurla təsdiqləndi!",
        no_lic: "❌ Aktiv lisenziyanız yoxdur.", limit_reached: "❌ Lisenziya limitinizə çatdınız (Maksimum: {max} nömrə).",
        enter_phone: "📱 Bota qoşmaq istədiyiniz Telegram nömrənizi daxil edin (+ işarəsi ilə. Məs: +994501234567):",
        no_numbers: "⚠️ Hələ heç bir nömrə əlavə edilməyib.", my_accounts: "⚙️ *Aktiv Hesablarınız:*\n\n",
        stopped: "🔴 Dayandırılıb", active: "🟢 Aktiv", stop_btn: "Dayandır: +", resume_btn: "Başlat: +", back_main: "🔙 Ana Menyu",
        phone_format: "⚠️ Nömrə '+' ilə başlamalıdır!", otp_sent: "⏳ OTP kodu göndərilir, gözləyin...",
        otp_info: "📩 Təhlükəsizlik kodu göndərildi. Kodu aralarında boşluqla daxil edin (Məs: 8 8 9 9 0):\n\nNömrəni səhv daxil etmisinizsə, /changenumber yazın.",
        err: "❌ Xəta: ", sess_lost: "⚠️ Sessiya yaddaşdan silinib. Zəhmət olmasa prosesə yenidən başlayın.",
        login_success: "✅ {phone} hesabına uğurla giriş edildi!\n\nİndi mesajın göndəriləcəyi qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:",
        otp_err: "❌ OTP səhvdir və ya hesabda 2-Mərhələli təsdiqləmə (2FA) aktivdir. Xəta: ",
        group_added: "✅ Qrup əlavə olundu. (Hazırda bu nömrə üçün {count} qrup var)\n\nBaşqa qrup əlavə etmək istəyirsiniz, yoxsa davam edək?",
        add_more: "➕ Başqa qrup əlavə et", finish_btn: "✅ Bitir və Davam Et", send_group: "Əlavə etmək istədiyiniz qrupun *istifadəçi adını* və ya *linkini* göndərin:",
        ask_interval: "✅ Qruplar təsdiqləndi. İndi mesajın neçə dəqiqədən bir atılacağını rəqəmlə yazın (Məs: 2, 3, 5):",
        interval_err: "⚠️ Zəhmət olmasa 2 ilə 60 arası bir rəqəm yazın.",
        bot_started: "✅ *Bot İşə Düşdü ({phone})!*\n\nBot hər {min} dəqiqədən bir Qeyd olunmuş mesajlarınızı (Saved Messages) hədəf qruplara atacaq.",
        ch1_btn: "📢 Məcburi Kanal 1", ch2_btn: "📢 Məcburi Kanal 2", all_stopped: "⏹ Bütün hesablar dayandırıldı.", stop_single: "⏹ +{phone} üçün göndərim dayandırıldı.",
        resume_single: "▶️ +{phone} yenidən işə düşdü.", enter_again: "🔄 Telefon nömrənizi yenidən daxil edin (+ işarəsi ilə):"
    },
    tr: {
        sub_msg: "Aşağıdaki kanallara abone olun:", sub_btn: "✅ Abonelikleri Onayla", checking: "⏳ Abonelik kontrol ediliyor...",
        confirmed: "✅ Onaylandı!", menu_unlic: "Lütfen lisansınızı aktifleştirin:", btn_act_lic: "🔑 Lisans Aktifleştir",
        btn_buy_lic: "🛒 Lisans Al / Destek", btn_price: "📋 Fiyat Listesi", btn_web: "🌐 Web Sitemiz",
        menu_lic: "✅ Lisans Aktif! Ana Menü:", btn_add_num: "➕ Yeni Numara Ekle", btn_manage: "⚙️ Hesaplarım (Numaralar)",
        enter_lic: "Lisans kodunu girin (Örn: ELITE-12345):", invalid_lic: "❌ Geçersiz lisans kodu formatı.",
        not_found_lic: "❌ Böyle bir lisans bulunamadı!", blocked_lic: "❌ Bu lisans engellenmiş!",
        used_lic: "❌ Bu lisans zaten kullanılıyor!", success_lic: "✅ Lisans başarıyla onaylandı!",
        no_lic: "❌ Aktif lisansınız yok.", limit_reached: "❌ Lisans limitinize ulaştınız (Maks: {max} numara).",
        enter_phone: "📱 Telegram numarasını girin (+ işareti ile. Örn: +905551234567):",
        no_numbers: "⚠️ Henüz numara eklenmedi.", my_accounts: "⚙️ *Aktif Hesaplarınız:*\n\n",
        stopped: "🔴 Durduruldu", active: "🟢 Aktif", stop_btn: "Durdur: +", resume_btn: "Başlat: +", back_main: "🔙 Ana Menü",
        phone_format: "⚠️ Numara '+' ile başlamalıdır!", otp_sent: "⏳ OTP kodu gönderiliyor, bekleyin...",
        otp_info: "📩 Kod gönderildi. Kodu aralarında boşluk bırakarak girin (Örn: 8 8 9 9 0):\n\nYanlış numara girdiyseniz /changenumber yazın.",
        err: "❌ Hata: ", sess_lost: "⚠️ Oturum silindi. Lütfen yeniden başlayın.",
        login_success: "✅ {phone} hesabına giriş yapıldı!\n\nŞimdi hedeflenen grubun *kullanıcı adını* veya *linkini* gönderin:",
        otp_err: "❌ OTP yanlış veya 2FA aktif. Hata: ",
        group_added: "✅ Grup eklendi. (Bu numara için {count} grup var)\n\nBaşka grup eklemek ister misiniz?",
        add_more: "➕ Başka grup ekle", finish_btn: "✅ Bitir ve Devam Et", send_group: "Eklemek istediğiniz grubun *kullanıcı adını* veya *linkini* gönderin:",
        ask_interval: "✅ Gruplar onaylandı. Mesajın kaç dakikada bir atılacağını yazın (Örn: 2, 3, 5):",
        interval_err: "⚠️ Lütfen 2 ile 60 arası rakam yazın.",
        bot_started: "✅ *Bot Çalışmaya Başladı ({phone})!*\n\nBot her {min} dakikada bir Kaydedilen Mesajlarınızı hedef gruplara atacaktır.",
        ch1_btn: "📢 Zorunlu Kanal 1", ch2_btn: "📢 Zorunlu Kanal 2", all_stopped: "⏹ Tüm hesaplar durduruldu.", stop_single: "⏹ +{phone} için gönderim durduruldu.",
        resume_single: "▶️ +{phone} yeniden başlatıldı.", enter_again: "🔄 Telefon numarasını yeniden girin (+ işareti ile):"
    },
    en: {
        sub_msg: "Please subscribe to the following channels:", sub_btn: "✅ Confirm Subscriptions", checking: "⏳ Checking subscription...",
        confirmed: "✅ Confirmed!", menu_unlic: "Please activate your license:", btn_act_lic: "🔑 Activate License",
        btn_buy_lic: "🛒 Buy License / Support", btn_price: "📋 Price List", btn_web: "🌐 Our Website",
        menu_lic: "✅ License Active! Main Menu:", btn_add_num: "➕ Add New Number", btn_manage: "⚙️ My Accounts (Numbers)",
        enter_lic: "Enter license code (E.g.: ELITE-12345):", invalid_lic: "❌ Invalid license format.",
        not_found_lic: "❌ License not found!", blocked_lic: "❌ This license is blocked!",
        used_lic: "❌ This license is already in use!", success_lic: "✅ License verified successfully!",
        no_lic: "❌ No active license.", limit_reached: "❌ License limit reached (Max: {max}).",
        enter_phone: "📱 Enter Telegram number (+ with country code. E.g.: +1234567890):",
        no_numbers: "⚠️ No numbers added yet.", my_accounts: "⚙️ *Your Active Accounts:*\n\n",
        stopped: "🔴 Stopped", active: "🟢 Active", stop_btn: "Stop: +", resume_btn: "Resume: +", back_main: "🔙 Main Menu",
        phone_format: "⚠️ Number must start with '+'!", otp_sent: "⏳ Sending OTP code, please wait...",
        otp_info: "📩 Security code sent. Enter it with spaces (E.g.: 8 8 9 9 0):\n\nIf wrong number, type /changenumber.",
        err: "❌ Error: ", sess_lost: "⚠️ Session lost. Please restart.",
        login_success: "✅ {phone} logged in successfully!\n\nNow send the *username* or *link* of the target group:",
        otp_err: "❌ Incorrect OTP or 2FA is active. Error: ",
        group_added: "✅ Group added. ({count} groups for this number)\n\nAdd another group or finish?",
        add_more: "➕ Add another group", finish_btn: "✅ Finish and Continue", send_group: "Send the *username* or *link* of the group:",
        ask_interval: "✅ Groups confirmed. Enter the interval in minutes (E.g.: 2, 3, 5):",
        interval_err: "⚠️ Enter a number between 2 and 60.",
        bot_started: "✅ *Bot Started ({phone})!*\n\nBot will forward your Saved Messages every {min} minutes.",
        ch1_btn: "📢 Channel 1", ch2_btn: "📢 Channel 2", all_stopped: "⏹ All accounts stopped.", stop_single: "⏹ Forwarding stopped for +{phone}.",
        resume_single: "▶️ +{phone} resumed.", enter_again: "🔄 Enter your phone number again (+ with code):"
    },
    ru: {
        sub_msg: "Пожалуйста, подпишитесь на каналы:", sub_btn: "✅ Подтвердить подписку", checking: "⏳ Проверка подписки...",
        confirmed: "✅ Подтверждено!", menu_unlic: "Пожалуйста, активируйте лицензию:", btn_act_lic: "🔑 Активировать лицензию",
        btn_buy_lic: "🛒 Купить лицензию / Поддержка", btn_price: "📋 Прайс-лист", btn_web: "🌐 Наш сайт",
        menu_lic: "✅ Лицензия активна! Главное меню:", btn_add_num: "➕ Добавить новый номер", btn_manage: "⚙️ Мои аккаунты (Номера)",
        enter_lic: "Введите код лицензии (Например: ELITE-12345):", invalid_lic: "❌ Неверный формат кода.",
        not_found_lic: "❌ Лицензия не найдена!", blocked_lic: "❌ Лицензия заблокирована!",
        used_lic: "❌ Лицензия уже используется!", success_lic: "✅ Лицензия успешно подтверждена!",
        no_lic: "❌ Нет активной лицензии.", limit_reached: "❌ Достигнут лимит лицензий (Макс: {max}).",
        enter_phone: "📱 Введите номер Telegram (+ с кодом страны. Напр: +79991234567):",
        no_numbers: "⚠️ Номера еще не добавлены.", my_accounts: "⚙️ *Ваши активные аккаунты:*\n\n",
        stopped: "🔴 Остановлен", active: "🟢 Активен", stop_btn: "Стоп: +", resume_btn: "Запуск: +", back_main: "🔙 Главное меню",
        phone_format: "⚠️ Номер должен начинаться с '+'!", otp_sent: "⏳ Отправка кода OTP, подождите...",
        otp_info: "📩 Код отправлен. Введите его через пробел (Напр: 8 8 9 9 0):\n\nЕсли ошибка в номере, введите /changenumber.",
        err: "❌ Ошибка: ", sess_lost: "⚠️ Сессия потеряна. Начните заново.",
        login_success: "✅ Успешный вход в аккаунт {phone}!\n\nТеперь отправьте *ссылку* или *username* целевой группы:",
        otp_err: "❌ Неверный OTP или активна 2FA. Ошибка: ",
        group_added: "✅ Группа добавлена. ({count} групп для этого номера)\n\nДобавить еще группу или продолжить?",
        add_more: "➕ Добавить еще группу", finish_btn: "✅ Завершить и продолжить", send_group: "Отправьте *username* или *ссылку* группы:",
        ask_interval: "✅ Группы подтверждены. Введите интервал в минутах (Напр: 2, 3, 5):",
        interval_err: "⚠️ Введите число от 2 до 60.",
        bot_started: "✅ *Бот запущен ({phone})!*\n\nБот будет пересылать Сохраненные сообщения каждые {min} минут.",
        ch1_btn: "📢 Канал 1", ch2_btn: "📢 Канал 2", all_stopped: "⏹ Все аккаунты остановлены.", stop_single: "⏹ Отправка для +{phone} остановлена.",
        resume_single: "▶️ +{phone} снова запущен.", enter_again: "🔄 Введите номер телефона снова (+ с кодом):"
    }
};

function t(key, lang = 'az', params = {}) {
    let text = i18n[lang]?.[key] || i18n['az'][key] || key;
    for (const [k, v] of Object.entries(params)) { text = text.replace(`{${k}}`, v); }
    return text;
}

async function getDB(path) {
  try { const res = await fetch(`${FIREBASE_URL}/${path}.json`); return await res.json(); } catch (e) { return null; }
}
async function setDB(path, data) {
  try { await fetch(`${FIREBASE_URL}/${path}.json`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (e) { console.error(e); }
}

// Bot Profil Məlumatlarının Avtomatik API Yoxlanışı və Yenilənməsi
let currentDesc = "", currentShortDesc = "";
setInterval(async () => {
    const settings = await getDB('settings');
    if (settings) {
        if (settings.botDescription && settings.botDescription !== currentDesc) {
            currentDesc = settings.botDescription;
            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ description: settings.botDescription })
            }).catch(()=>{});
        }
        if (settings.botShortDescription && settings.botShortDescription !== currentShortDesc) {
            currentShortDesc = settings.botShortDescription;
            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyShortDescription`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ short_description: settings.botShortDescription })
            }).catch(()=>{});
        }
    }
}, 30000);

async function resolveTargetEntity(client, rawTarget) {
  let g = String(rawTarget).trim().replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/^@/, '');
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

// ARDIÇILLIQ VƏ MENYULARIN AYRILMASI
async function showMainMenu(chatId, lang) {
    const user = await getDB(`users/${chatId}`) || {};
    const activeLicense = user.activeLicense;
    const settings = await getDB('settings') || {};
    const inline_keyboard = [];
    
    if (!activeLicense) {
        // Lisenziya aktivləşdirilmədən əvvəlki menyu
        inline_keyboard.push([{ text: t('btn_act_lic', lang), callback_data: "enter_license" }]);
        inline_keyboard.push([{ text: t('btn_buy_lic', lang), url: settings.support || "https://t.me/EliteNetworkk" }]);
        inline_keyboard.push([{ text: t('btn_price', lang), url: settings.priceUrl || "https://t.me/EliteBotMedia/13" }]);
        if(settings.webUrl) inline_keyboard.push([{ text: t('btn_web', lang), url: settings.webUrl }]);
        
        bot.sendMessage(chatId, t('menu_unlic', lang), { reply_markup: { inline_keyboard } });
    } else {
        // Lisenziya aktiv olduqdan sonrakı əsas menyu
        inline_keyboard.push([{ text: t('btn_add_num', lang), callback_data: "add_new_number" }]);
        inline_keyboard.push([{ text: t('btn_manage', lang), callback_data: "manage_numbers" }]);
        bot.sendMessage(chatId, t('menu_lic', lang), { reply_markup: { inline_keyboard } });
    }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await setDB(`users/${chatId}/state`, "START");

  const settings = await getDB('settings') || {};
  const greetingMsg = settings.greetingMessage || "Dil seçin / Seçim yapın / Select / Выберите:";
  const photoUrl = settings.startPhotoUrl; // Profil Şəkli (Start Photo)
  
  const keyboard = {
    inline_keyboard: [
      [{ text: "🇦🇿 Azərbaycan", callback_data: "lang_az" }, { text: "🇹🇷 Türkçe", callback_data: "lang_tr" }],
      [{ text: "🇬🇧 English", callback_data: "lang_en" }, { text: "🇷🇺 Русский", callback_data: "lang_ru" }]
    ]
  };

  // Əgər admin paneldə şəkil linki varsa, bot ilk mesajı şəkil ilə atacaq
  if (photoUrl && photoUrl.startsWith('http')) {
      bot.sendPhoto(chatId, photoUrl, { caption: greetingMsg, reply_markup: keyboard }).catch(() => {
          bot.sendMessage(chatId, greetingMsg, { reply_markup: keyboard });
      });
  } else {
      bot.sendMessage(chatId, greetingMsg, { reply_markup: keyboard });
  }
});

bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";
  const user = await getDB(`users/${chatId}`);
  if (user && user.accounts) {
      for (const phone in user.accounts) {
          await setDB(`users/${chatId}/accounts/${phone}/status`, "STOPPED");
      }
  }
  bot.sendMessage(chatId, t('all_stopped', userLang));
});

bot.onText(/\/changenumber/, async (msg) => {
  const chatId = msg.chat.id;
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";
  delete userSessions[chatId];
  await setDB(`users/${chatId}/state`, "AWAITING_PHONE");
  bot.sendMessage(chatId, t('enter_again', userLang));
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";

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
        [{ text: t('sub_btn', lang), callback_data: "check_subscription" }]
      ]
    };
    bot.sendMessage(chatId, t('sub_msg', lang), { reply_markup: keyboard });
  }

  // TƏSDİQLƏMƏ (Bypass qarşısı alındı, Yoxlama simulyasiyası əlavə edildi)
  if (data === "check_subscription") {
    // 1. Təsdiqlənir mesajı atırıq
    const waitMsg = await bot.sendMessage(chatId, t('checking', userLang));
    
    // 2. Bir az gözləyirik ki, real yoxlama hissi yaransın (1.5 saniyə)
    setTimeout(async () => {
        await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
        await bot.sendMessage(chatId, t('confirmed', userLang));
        // 3. Təsdiqdən sonra yalnız Lisenziya düymələrini açırıq!
        showMainMenu(chatId, userLang);
    }, 1500);
  }

  if (data === "enter_license") {
    await setDB(`users/${chatId}/state`, "AWAITING_LICENSE");
    bot.sendMessage(chatId, t('enter_lic', userLang));
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
      bot.sendMessage(chatId, t('enter_phone', userLang));
  }

  if (data === "manage_numbers") {
      const user = await getDB(`users/${chatId}`);
      if (!user || !user.accounts) return bot.sendMessage(chatId, t('no_numbers', userLang));
      
      let msg = t('my_accounts', userLang);
      const inline_keyboard = [];
      
      for (const phone in user.accounts) {
          const acc = user.accounts[phone];
          const status = acc.status === "ACTIVE" ? t('active', userLang) : t('stopped', userLang);
          msg += `📱 +${phone}\n⏳ İnterval: ${acc.intervalMinutes} dəq\n📊 ${status}\n\n`;
          
          const actionText = acc.status === "ACTIVE" ? t('stop_btn', userLang) + phone : t('resume_btn', userLang) + phone;
          const actionData = acc.status === "ACTIVE" ? `stop_${phone}` : `resume_${phone}`;
          inline_keyboard.push([{ text: actionText, callback_data: actionData }]);
      }
      inline_keyboard.push([{ text: t('back_main', userLang), callback_data: "back_to_main" }]);
      bot.sendMessage(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  if (data.startsWith("stop_")) {
      const phoneKey = data.replace("stop_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "STOPPED");
      bot.sendMessage(chatId, t('stop_single', userLang, { phone: phoneKey }));
      showMainMenu(chatId, userLang);
  }
  if (data.startsWith("resume_")) {
      const phoneKey = data.replace("resume_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "ACTIVE");
      bot.sendMessage(chatId, t('resume_single', userLang, { phone: phoneKey }));
      showMainMenu(chatId, userLang);
  }

  if (data === "back_to_main") showMainMenu(chatId, userLang);

  if (data === "add_more_group") {
    await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
    bot.sendMessage(chatId, t('send_group', userLang), { parse_mode: "Markdown" });
  }

  if (data === "finish_groups") {
    await setDB(`users/${chatId}/state`, "AWAITING_INTERVAL");
    bot.sendMessage(chatId, t('ask_interval', userLang));
  }
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";
  const state = await getDB(`users/${chatId}/state`);

  if (state === "AWAITING_LICENSE") {
    if (!text.startsWith("ELITE-")) return bot.sendMessage(chatId, t('invalid_lic', userLang));
    
    const lic = await getDB(`licenses/${text}`);
    if (!lic) return bot.sendMessage(chatId, t('not_found_lic', userLang));
    if (!lic.active) return bot.sendMessage(chatId, t('blocked_lic', userLang));
    
    if (lic.ownerId && lic.ownerId !== chatId) return bot.sendMessage(chatId, t('used_lic', userLang));
    if (!lic.ownerId) await setDB(`licenses/${text}/ownerId`, chatId);
    
    await setDB(`users/${chatId}/activeLicense`, text);
    await setDB(`users/${chatId}/state`, "IDLE");
    
    bot.sendMessage(chatId, t('success_lic', userLang));
    return showMainMenu(chatId, userLang);
  }

  if (state === "AWAITING_PHONE") {
    if (!text.startsWith("+")) return bot.sendMessage(chatId, t('phone_format', userLang));
    bot.sendMessage(chatId, t('otp_sent', userLang));

    try {
      const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 5 });
      await client.connect();
      const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, text);

      userSessions[chatId] = { client, phone: text, phoneCodeHash };
      await setDB(`users/${chatId}/currentPhoneSetup`, text);
      await setDB(`users/${chatId}/state`, "AWAITING_OTP");
      bot.sendMessage(chatId, t('otp_info', userLang));
    } catch (err) {
      bot.sendMessage(chatId, t('err', userLang) + err.message);
    }
    return;
  }

  if (state === "AWAITING_OTP") {
    const rawOtp = text.replace(/\s+/g, '');
    const sessionData = userSessions[chatId];
    if (!sessionData) return bot.sendMessage(chatId, t('sess_lost', userLang));

    try {
      await sessionData.client.invoke(new Api.auth.SignIn({ phoneNumber: sessionData.phone, phoneCodeHash: sessionData.phoneCodeHash, phoneCode: rawOtp }));
      const savedSession = sessionData.client.session.save();
      const phoneKey = sessionData.phone.replace('+', ''); 

      await setDB(`users/${chatId}/accounts/${phoneKey}/telegramSession`, savedSession);
      await setDB(`users/${chatId}/accounts/${phoneKey}/targetGroups`, []);
      
      const activeLicense = await getDB(`users/${chatId}/activeLicense`);
      await setDB(`licenses/${activeLicense}/registeredPhones/${phoneKey}`, true);

      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      bot.sendMessage(chatId, t('login_success', userLang, { phone: sessionData.phone }), { parse_mode: "Markdown" });
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
        [{ text: t('finish_btn', userLang), callback_data: "finish_groups" }]
      ]
    };
    bot.sendMessage(chatId, t('group_added', userLang, { count: existing.length }), { reply_markup: keyboard });
    return;
  }

  if (state === "AWAITING_INTERVAL") {
    const min = parseInt(text);
    if (isNaN(min) || min < 2 || min > 60) return bot.sendMessage(chatId, t('interval_err', userLang));

    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');

    await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, min);
    await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, 0);
    await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "ACTIVE");
    await setDB(`users/${chatId}/state`, "IDLE");

    bot.sendMessage(chatId, t('bot_started', userLang, { phone: currentPhone, min: min }), { parse_mode: "Markdown" });
    showMainMenu(chatId, userLang);
  }
});

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
                  console.error(`(${phoneKey}) -> ${g} XƏTA:`, sendErr.message);
                }
              }
              await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, now);
            }
          }
        } catch (err) {
          console.error(`(${phoneKey}) xəta:`, err.message);
        } finally {
          if (client) { try { await client.disconnect(); } catch (e) {} }
        }
    }
  }
}, 30000);
