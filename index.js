const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fetch = require('node-fetch');
const http = require('http');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end("Bot işləyir."); }).listen(PORT, () => {
  console.log(`Health-check serveri ${PORT} portunda işə düşdü.`);
});

// Render-də botun dayanmaması üçün hər 4 dəqiqədən bir özünə ping
setInterval(() => {
  fetch(`http://localhost:${PORT}`).catch(() => {});
}, 240000);

const BOT_TOKEN = "8940602664:AAHbe3HRkoselmfmUgmzvwWuJFfPkrCnKUg";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://botadmin-53dc8-default-rtdb.europe-west1.firebasedatabase.app";

const bot = new TelegramBot(BOT_TOKEN);

bot.deleteWebHook().then(() => {
    console.log("Köhnə webhook təmizləndi, Polling başladılır...");
    bot.startPolling({ restart: true, params: { timeout: 10 } });
}).catch(err => {
    console.error("Webhook silinməsində xəta:", err);
    bot.startPolling({ restart: true, params: { timeout: 10 } });
});

const userSessions = {};
const mainMessageIds = new Map();

console.log("EliteBot Serveri Başladı...");

bot.on('polling_error', (error) => {
  console.error('Polling xətası:', error.message);
  if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
    console.log('409 Conflict – polling yenidən başladılır...');
    bot.stopPolling()
      .then(() => setTimeout(() => bot.startPolling({ restart: true }), 2000))
      .catch(() => setTimeout(() => bot.startPolling({ restart: true }), 2000));
  }
});

// Default settings yarat (əgər bazada yoxdursa)
(async function initSettings() {
  try {
    const settings = await getDB('settings');
    if (!settings) {
      await setDB('settings', {
        channel1: "https://t.me/EliteBotDestek",
        channel2: "https://t.me/EliteBotMedia",
        channel1_id: "@EliteBotDestek",
        channel2_id: "@EliteBotMedia",
        webUrl: "https://EliteBot.com",
        startPhotoUrl: "",
        botDescription: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅İ𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅İ𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
        botShortDescription: "Elite Otomesaj Botu",
        botProfilePhoto: ""
      });
      console.log("Default settings yaradıldı.");
    }
  } catch (e) { console.error("initSettings xətası:", e); }
})();

const i18n = {
    az: {
        about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅İ𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
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
        stopped: "🔴 Dayandırılıb", active: "🟢 Aktiv", stop_btn: "⏹ Dayandır", resume_btn: "▶️ Başlat", back_main: "🔙 Ana Menyu",
        phone_format: "⚠️ Nömrə '+' ilə başlamalıdır!\n\nZəhmət olmasa düzgün formatda daxil edin.", otp_sent: "⏳ OTP kodu göndərilir, gözləyin...",
        otp_info: "📩 Təhlükəsizlik kodu göndərildi. Kodu aralarında boşluqla daxil edin (Məs: 8 8 9 9 0):\n\nNömrəni səhv daxil etmisinizsə, /changenumber yazın.",
        err: "❌ Xəta: ", sess_lost: "⚠️ Sessiya yaddaşdan silinib. Zəhmət olmasa prosesə yenidən başlayın.",
        login_success: "✅ {phone} hesabına uğurla giriş edildi!\n\nİndi mesajın göndəriləcəyi qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:",
        otp_err: "❌ OTP səhvdir və ya hesabda 2-Mərhələli təsdiqləmə (2FA) aktivdir. Xəta: ",
        group_added: "✅ Qrup əlavə olundu. (Hazırda bu nömrə üçün {count} qrup var)\n\nBaşqa qrup əlavə etmək istəyirsiniz, yoxsa davam edək?",
        add_more: "➕ Başqa qrup əlavə et", finish_btn: "✅ Bitir və Davam Et", send_group: "Əlavə etmək istədiyiniz qrupun *istifadəçi adını* və ya *linkini* göndərin:",
        ask_interval: "✅ Qruplər təsdiqləndi. İndi mesajın neçə dəqiqədən bir atılacağını rəqəmlə yazın (Yalnız 2 - 5 arası):",
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
        change_interval_btn: "⏱ Intervalı Dəyiş",
        admin_phone_change_prompt: "🔔 Admin tərəfindən nömrəniz dəyişdirildi. Yeni nömrəyə göndərilən OTP kodu daxil edin:",
        auto_reply_set: "✅ Avtomatik cavab mesajınız təyin olundu və aktivləşdirildi. İndi sizə yazılan istənilən mesaja bu mətn avtomatik göndəriləcək.",
        auto_reply_deleted: "✅ Avtomatik cavab mesajı silindi.",
        auto_reply_btn: "📩 Avtomatik Cavab",
        set_auto_reply: "📩 Avtomatik cavab mesajınızı daxil edin (Ləğv etmək üçün /cancel yazın):",
        phone_format_back_btn: "🔙 Ana Menyuya qayıt",
        scan_btn: "🔍 Qrup Skanı",
        scanning: "⏳ Qruplər skan edilir...",
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
        session_expired: "⚠️ Sessiya vaxtı bitdi. Zəhmət olmasa yenidən skan edin.",
        auto_reply_on: "🟢 Avtocavab aktivdir",
        auto_reply_off: "🔴 Avtocavab dayandırılıb",
        auto_reply_toggle_on: "▶️ Avtocavabı Başlat",
        auto_reply_toggle_off: "⏹ Avtocavabı Dayandır",
        auto_reply_enabled: "✅ Avtocavab aktivləşdirildi.",
        auto_reply_disabled: "✅ Avtocavab dayandırıldı."
    },
    tr: {
        about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆𝐈𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅𝐈𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
        sub_msg: "Aşağıdaki kanallara abone olun:", sub_btn: "✅ Abonelikleri Doğrula", checking: "⏳ Abonelik kontrol ediliyor...",
        confirmed: "✅ Doğrulandı!", not_subscribed: "❌ Henüz tüm kanallara abone olmadınız! Lütfen önce kanallara katılın ve tekrar kontrol edin.",
        menu_unlic: "Lütfen bir lisans etkinleştirin:", btn_act_lic: "🔑 Lisans Etkinleştir",
        btn_buy_lic: "🛒 Lisans Satın Al / Destek", btn_price: "📋 Fiyat Listesi", btn_web: "🌐 Web Sitemiz",
        menu_lic: "✅ Lisans Aktif! Ana Menü:", btn_add_num: "➕ Yeni Numara Ekle", btn_manage: "⚙️ Hesaplarım (Numaralar)",
        enter_lic: "Lisans kodunu girin (Örneğin: ELITE-12345):", invalid_lic: "❌ Geçersiz lisans kodu formatı.",
        not_found_lic: "❌ Böyle bir lisans veritabanında mevcut değil!", blocked_lic: "❌ Bu lisans engellenmiş!",
        used_lic: "❌ Bu lisans zaten başka bir kullanıcı tarafından kullanılıyor!", success_lic: "✅ Lisans başarıyla doğrulandı!",
        no_lic: "❌ Aktif lisansınız yok.", limit_reached: "❌ Lisans limitinize ulaştınız (Maksimum: {max} numara).",
        enter_phone: "📱 Bota bağlamak istediğiniz Telegram numaranızı girin (+ işareti ile. Örn: +90501234567):",
        no_numbers: "⚠️ Henüz hiç numara eklenmedi.", my_accounts: "⚙️ *Aktif Hesaplarınız:*\n\n",
        stopped: "🔴 Durduruldu", active: "🟢 Aktif", stop_btn: "⏹ Durdur", resume_btn: "▶️ Başlat", back_main: "🔙 Ana Menü",
        phone_format: "⚠️ Numara '+' ile başlamalıdır!\n\nLütfen doğru formatta girin.", otp_sent: "⏳ OTP kodu gönderiliyor, bekleyin...",
        otp_info: "📩 Güvenlik kodu gönderildi. Kodu aralarında boşluk bırakarak girin (Örn: 8 8 9 9 0):\n\nNumarayı yanlış girdiyseniz /changenumber yazın.",
        err: "❌ Hata: ", sess_lost: "⚠️ Oturum hafızadan silindi. Lütfen süreci yeniden başlatın.",
        login_success: "✅ {phone} hesabına başarıyla giriş yapıldı!\n\nŞimdi mesajın gönderileceği grubun *kullanıcı adını* (örn: @grupadi) veya *bağlantısını* gönderin:",
        otp_err: "❌ OTP yanlış veya hesapta 2 Aşamalı Doğrulama (2FA) aktif. Hata: ",
        group_added: "✅ Grup eklendi. (Şu anda bu numara için {count} grup var)\n\nBaşka grup eklemek istiyor musunuz, yoksa devam edelim mi?",
        add_more: "➕ Başka grup ekle", finish_btn: "✅ Bitir ve Devam Et", send_group: "Eklemek istediğiniz grubun *kullanıcı adını* veya *bağlantısını* gönderin:",
        ask_interval: "✅ Gruplar onaylandı. Şimdi mesajın kaç dakikada bir atılacağını rakamla yazın (Sadece 2 - 5 arası):",
        interval_err: "⚠️ Lütfen 2 ile 5 arasında bir rakam yazın.",
        bot_started: "✅ *Bot Çalışmaya Başladı ({phone})!*\n\nBot her {min} dakikada bir seçilen kaynaktan mesajları hedef gruplara atacak.",
        ch1_btn: "📢 Zorunlu Kanal 1", ch2_btn: "📢 Zorunlu Kanal 2", all_stopped: "⏹ Tüm hesaplar durduruldu.", stop_single: "⏹ +{phone} için gönderim durduruldu.",
        resume_single: "▶️ +{phone} yeniden çalışmaya başladı.", enter_again: "🔄 Telefon numaranızı yeniden girin (+ işareti ile):",
        source_prompt: "📥 Mesajlar nereden alınsın?",
        source_saved_btn: "💾 Kaydedilen mesajlar",
        source_custom_btn: "🔗 Özel Kanal/Grup/Bot",
        enter_source: "📢 Mesajın alınacağı kanal/grup/botun kullanıcı adını (@) veya bağlantısını gönderin:",
        invalid_source: "❌ Girdiğiniz kaynağa erişilemedi. Lütfen geçerli bir kullanıcı adı/bağlantı gönderin.",
        source_set_saved: "✅ Kaynak: Kaydedilen mesajlar.",
        source_set_custom: "✅ Kaynak belirlendi: {target}",
        cancel_btn: "❌ İptal Et",
        groups_btn: "📋 Grupları Yönet",
        source_btn: "📥 Kaynağı Yönet",
        delete_btn: "🗑 Numarayı Sil",
        back_btn: "🔙 Geri",
        del_group_btn: "❌ Sil: {group}",
        del_source_btn: "❌ Kaynağı sil (Kaydedilen mesajlara döndür)",
        no_groups: "❌ Hiçbir grup eklenmedi.",
        confirm_delete_num: "❗️ +{phone} numarasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!",
        confirm_delete_num_yes: "✅ Evet, sil",
        confirm_delete_num_no: "❌ Hayır",
        num_deleted: "✅ +{phone} numarası sistemden silindi.",
        group_deleted: "✅ Grup silindi.",
        source_deleted: "✅ Kaynak silindi, artık kaydedilen mesajlar kullanılacak.",
        add_group_btn: "➕ Yeni Grup Ekle",
        change_source_btn: "🔄 Kaynağı Değiştir",
        change_interval_btn: "⏱ Aralığı Değiştir",
        admin_phone_change_prompt: "🔔 Admin tarafından numaranız değiştirildi. Yeni numaraya gönderilen OTP kodunu girin:",
        auto_reply_set: "✅ Otomatik yanıt mesajınız belirlendi ve etkinleştirildi. Artık size yazılan herhangi bir mesaja bu metin otomatik olarak gönderilecek.",
        auto_reply_deleted: "✅ Otomatik yanıt mesajı silindi.",
        auto_reply_btn: "📩 Otomatik Yanıt",
        set_auto_reply: "📩 Otomatik yanıt mesajınızı girin (İptal etmek için /cancel yazın):",
        phone_format_back_btn: "🔙 Ana Menüye dön",
        scan_btn: "🔍 Grup Taraması",
        scanning: "⏳ Gruplar taranıyor...",
        select_groups: "📋 Aşağıdaki gruplardan seçim yapın. Seçilenler: {count}",
        scan_select: "✅ Seç",
        scan_unselect: "❌ Kaldır",
        scan_confirm: "✅ Seçilenleri ekle",
        scan_more: "⏭ Sonraki sayfa",
        scan_back: "⏮ Önceki sayfa",
        scan_done: "✅ Seçilen {count} grup hedef listesine eklendi.",
        no_groups_found: "❌ Bu hesabın üye olduğu hiçbir grup bulunamadı.",
        scan_page: "Sayfa {page}/{total}",
        new_interval_prompt: "⏱ Yeni aralığı girin (2-5 dakika):",
        interval_updated: "✅ Aralık {min} dakikaya değiştirildi.",
        session_expired: "⚠️ Oturum zaman aşımına uğradı. Lütfen tekrar tarayın.",
        auto_reply_on: "🟢 Otomatik yanıt aktif",
        auto_reply_off: "🔴 Otomatik yanıt durduruldu",
        auto_reply_toggle_on: "▶️ Otomatik Yanıtı Başlat",
        auto_reply_toggle_off: "⏹ Otomatik Yanıtı Durdur",
        auto_reply_enabled: "✅ Otomatik yanıt etkinleştirildi.",
        auto_reply_disabled: "✅ Otomatik yanıt durduruldu."
    },
    en: {
        about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅𝐈𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
        sub_msg: "Please subscribe to the channels below:", sub_btn: "✅ Verify Subscriptions", checking: "⏳ Checking subscription...",
        confirmed: "✅ Confirmed!", not_subscribed: "❌ You have not subscribed to all channels yet! Please join the channels first and check again.",
        menu_unlic: "Please activate a license:", btn_act_lic: "🔑 Activate License",
        btn_buy_lic: "🛒 Buy License / Support", btn_price: "📋 Price List", btn_web: "🌐 Our Website",
        menu_lic: "✅ License Active! Main Menu:", btn_add_num: "➕ Add New Number", btn_manage: "⚙️ My Accounts (Numbers)",
        enter_lic: "Enter license code (Example: ELITE-12345):", invalid_lic: "❌ Invalid license code format.",
        not_found_lic: "❌ Such license does not exist in the database!", blocked_lic: "❌ This license is blocked!",
        used_lic: "❌ This license is already used by another user!", success_lic: "✅ License successfully verified!",
        no_lic: "❌ You don't have an active license.", limit_reached: "❌ You have reached your license limit (Maximum: {max} numbers).",
        enter_phone: "📱 Enter the Telegram number you want to connect to the bot (with '+' sign. Ex: +994501234567):",
        no_numbers: "⚠️ No numbers have been added yet.", my_accounts: "⚙️ *Your Active Accounts:*\n\n",
        stopped: "🔴 Stopped", active: "🟢 Active", stop_btn: "⏹ Stop", resume_btn: "▶️ Start", back_main: "🔙 Main Menu",
        phone_format: "⚠️ Number must start with '+'!\n\nPlease enter in correct format.", otp_sent: "⏳ Sending OTP code, please wait...",
        otp_info: "📩 Security code sent. Enter the code with spaces between digits (Ex: 8 8 9 9 0):\n\nIf you entered the wrong number, type /changenumber.",
        err: "❌ Error: ", sess_lost: "⚠️ Session cleared from memory. Please restart the process.",
        login_success: "✅ Successfully logged in to {phone}!\n\nNow send the *username* (ex: @groupname) or *link* of the group where the message will be sent:",
        otp_err: "❌ OTP is incorrect or Two-Step Verification (2FA) is enabled on the account. Error: ",
        group_added: "✅ Group added. (Currently there are {count} groups for this number)\n\nDo you want to add another group or continue?",
        add_more: "➕ Add another group", finish_btn: "✅ Finish and Continue", send_group: "Send the *username* or *link* of the group you want to add:",
        ask_interval: "✅ Groups confirmed. Now enter the interval in minutes with a number (Only between 2 - 5):",
        interval_err: "⚠️ Please enter a number between 2 and 5.",
        bot_started: "✅ *Bot Started ({phone})!*\n\nBot will forward messages from the selected source to target groups every {min} minutes.",
        ch1_btn: "📢 Mandatory Channel 1", ch2_btn: "📢 Mandatory Channel 2", all_stopped: "⏹ All accounts stopped.", stop_single: "⏹ Forwarding stopped for +{phone}.",
        resume_single: "▶️ +{phone} resumed working.", enter_again: "🔄 Re-enter your phone number (with '+' sign):",
        source_prompt: "📥 Where should messages be taken from?",
        source_saved_btn: "💾 Saved messages",
        source_custom_btn: "🔗 Custom Channel/Group/Bot",
        enter_source: "📢 Send the username (@) or link of the channel/group/bot to take messages from:",
        invalid_source: "❌ Could not access the source you entered. Please send a valid username/link.",
        source_set_saved: "✅ Source: Saved messages.",
        source_set_custom: "✅ Source set: {target}",
        cancel_btn: "❌ Cancel",
        groups_btn: "📋 Manage Groups",
        source_btn: "📥 Manage Source",
        delete_btn: "🗑 Delete Number",
        back_btn: "🔙 Back",
        del_group_btn: "❌ Delete: {group}",
        del_source_btn: "❌ Delete source (Revert to saved messages)",
        no_groups: "❌ No groups added.",
        confirm_delete_num: "❗️ Are you sure you want to delete +{phone}? This action cannot be undone!",
        confirm_delete_num_yes: "✅ Yes, delete",
        confirm_delete_num_no: "❌ No",
        num_deleted: "✅ +{phone} number deleted from system.",
        group_deleted: "✅ Group deleted.",
        source_deleted: "✅ Source deleted, saved messages will be used now.",
        add_group_btn: "➕ Add New Group",
        change_source_btn: "🔗 Change Source",
        change_interval_btn: "⏱ Change Interval",
        admin_phone_change_prompt: "🔔 Your number was changed by admin. Enter the OTP code sent to the new number:",
        auto_reply_set: "✅ Auto-reply message set and activated. This text will now be automatically sent to any message written to you.",
        auto_reply_deleted: "✅ Auto-reply message deleted.",
        auto_reply_btn: "📩 Auto Reply",
        set_auto_reply: "📩 Enter your auto-reply message (Type /cancel to cancel):",
        phone_format_back_btn: "🔙 Return to Main Menu",
        scan_btn: "🔍 Group Scan",
        scanning: "⏳ Scanning groups...",
        select_groups: "📋 Select from the groups below. Selected: {count}",
        scan_select: "✅ Select",
        scan_unselect: "❌ Remove",
        scan_confirm: "✅ Add selected",
        scan_more: "⏭ Next page",
        scan_back: "⏮ Previous page",
        scan_done: "✅ Selected {count} groups added to target list.",
        no_groups_found: "❌ No groups found that this account is a member of.",
        scan_page: "Page {page}/{total}",
        new_interval_prompt: "⏱ Enter new interval (2-5 minutes):",
        interval_updated: "✅ Interval changed to {min} minutes.",
        session_expired: "⚠️ Session expired. Please scan again.",
        auto_reply_on: "🟢 Auto-reply active",
        auto_reply_off: "🔴 Auto-reply stopped",
        auto_reply_toggle_on: "▶️ Start Auto-reply",
        auto_reply_toggle_off: "⏹ Stop Auto-reply",
        auto_reply_enabled: "✅ Auto-reply enabled.",
        auto_reply_disabled: "✅ Auto-reply disabled."
    },
    ru: {
        about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆𝐈𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅İ𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
        sub_msg: "Пожалуйста, подпишитесь на каналы ниже:", sub_btn: "✅ Подтвердить подписку", checking: "⏳ Проверка подписки...",
        confirmed: "✅ Подтверждено!", not_subscribed: "❌ Вы еще не подписались на все каналы! Пожалуйста, сначала подпишитесь и проверьте снова.",
        menu_unlic: "Пожалуйста, активируйте лицензию:", btn_act_lic: "🔑 Активировать лицензию",
        btn_buy_lic: "🛒 Купить лицензию / Поддержка", btn_price: "📋 Прайс-лист", btn_web: "🌐 Наш сайт",
        menu_lic: "✅ Лицензия активна! Главное меню:", btn_add_num: "➕ Добавить новый номер", btn_manage: "⚙️ Мои аккаунты (Номера)",
        enter_lic: "Введите код лицензии (Пример: ELITE-12345):", invalid_lic: "❌ Неверный формат кода лицензии.",
        not_found_lic: "❌ Такая лицензия не существует в базе данных!", blocked_lic: "❌ Эта лицензия заблокирована!",
        used_lic: "❌ Эта лицензия уже используется другим пользователем!", success_lic: "✅ Лицензия успешно подтверждена!",
        no_lic: "❌ У вас нет активной лицензии.", limit_reached: "❌ Вы достигли лимита лицензии (Максимум: {max} номеров).",
        enter_phone: "📱 Введите номер Telegram, который хотите подключить к боту (с знаком '+'. Прим: +994501234567):",
        no_numbers: "⚠️ Номера еще не добавлены.", my_accounts: "⚙️ *Ваши активные аккаунты:*\n\n",
        stopped: "🔴 Остановлено", active: "🟢 Активно", stop_btn: "⏹ Остановить", resume_btn: "▶️ Запустить", back_main: "🔙 Главное меню",
        phone_format: "⚠️ Номер должен начинаться с '+'!\n\nПожалуйста, введите в правильном формате.", otp_sent: "⏳ Отправка OTP кода, подождите...",
        otp_info: "📩 Код безопасности отправлен. Введите код с пробелами между цифрами (Прим: 8 8 9 9 0):\n\nЕсли вы ввели неверный номер, напишите /changenumber.",
        err: "❌ Ошибка: ", sess_lost: "⚠️ Сессия удалена из памяти. Пожалуйста, перезапустите процесс.",
        login_success: "✅ Успешный вход в аккаунт {phone}!\n\nТеперь отправьте *имя пользователя* (прим: @groupname) или *ссылку* на группу, куда будет отправляться сообщение:",
        otp_err: "❌ Неверный OTP или включена двухэтапная аутентификация (2FA). Ошибка: ",
        group_added: "✅ Группа добавлена. (В настоящее время для этого номера {count} групп)\n\nХотите добавить еще группу или продолжить?",
        add_more: "➕ Добавить другую группу", finish_btn: "✅ Завершить и продолжить", send_group: "Отправьте *имя пользователя* или *ссылку* на группу, которую хотите добавить:",
        ask_interval: "✅ Группы подтверждены. Теперь введите интервал в минутах цифрой (Только от 2 до 5):",
        interval_err: "⚠️ Пожалуйста, введите число от 2 до 5.",
        bot_started: "✅ *Бот запущен ({phone})!*\n\nБот будет пересылать сообщения из выбранного источника в целевые группы каждые {min} минут.",
        ch1_btn: "📢 Обязательный канал 1", ch2_btn: "📢 Обязательный канал 2", all_stopped: "⏹ Все аккаунты остановлены.", stop_single: "⏹ Пересылка остановлена для +{phone}.",
        resume_single: "▶️ +{phone} возобновил работу.", enter_again: "🔄 Введите номер телефона снова (с знаком '+'):",
        source_prompt: "📥 Откуда брать сообщения?",
        source_saved_btn: "💾 Сохраненные сообщения",
        source_custom_btn: "🔗 Пользовательский канал/группа/бот",
        enter_source: "📢 Отправьте имя пользователя (@) или ссылку на канал/группу/бот для получения сообщений:",
        invalid_source: "❌ Не удалось получить доступ к введенному источнику. Пожалуйста, отправьте правильное имя пользователя/ссылку.",
        source_set_saved: "✅ Источник: Сохраненные сообщения.",
        source_set_custom: "✅ Источник установлен: {target}",
        cancel_btn: "❌ Отмена",
        groups_btn: "📋 Управление группами",
        source_btn: "📥 Управление источником",
        delete_btn: "🗑 Удалить номер",
        back_btn: "🔙 Назад",
        del_group_btn: "❌ Удалить: {group}",
        del_source_btn: "❌ Удалить источник (Вернуть в сохраненные сообщения)",
        no_groups: "❌ Никакие группы не добавлены.",
        confirm_delete_num: "❗️ Вы уверены, что хотите удалить номер +{phone}? Это действие нельзя отменить!",
        confirm_delete_num_yes: "✅ Да, удалить",
        confirm_delete_num_no: "❌ Нет",
        num_deleted: "✅ Номер +{phone} удален из системы.",
        group_deleted: "✅ Группа удалена.",
        source_deleted: "✅ Источник удален, теперь будут использоваться сохраненные сообщения.",
        add_group_btn: "➕ Добавить новую группу",
        change_source_btn: "🔄 Изменить источник",
        change_interval_btn: "⏱ Изменить интервал",
        admin_phone_change_prompt: "🔔 Ваш номер был изменен администратором. Введите OTP код, отправленный на новый номер:",
        auto_reply_set: "✅ Автоответ настроен и активирован. Этот текст теперь будет автоматически отправляться на любое сообщение, написанное вам.",
        auto_reply_deleted: "✅ Автоответ удален.",
        auto_reply_btn: "📩 Автоответ",
        set_auto_reply: "📩 Введите сообщение автоответа (Для отмены напишите /cancel):",
        phone_format_back_btn: "🔙 Вернуться в главное меню",
        scan_btn: "🔍 Сканирование групп",
        scanning: "⏳ Сканирование групп...",
        select_groups: "📋 Выберите из групп ниже. Выбрано: {count}",
        scan_select: "✅ Выбрать",
        scan_unselect: "❌ Удалить",
        scan_confirm: "✅ Добавить выбранные",
        scan_more: "⏭ Следующая страница",
        scan_back: "⏮ Предыдущая страница",
        scan_done: "✅ Выбранные {count} групп добавлены в список целей.",
        no_groups_found: "❌ Не найдено групп, в которых этот аккаунт состоит.",
        scan_page: "Страница {page}/{total}",
        new_interval_prompt: "⏱ Введите новый интервал (2-5 минут):",
        interval_updated: "✅ Интервал изменен на {min} минут.",
        session_expired: "⚠️ Сессия истекла. Пожалуйста, отсканируйте заново.",
        auto_reply_on: "🟢 Автоответ активен",
        auto_reply_off: "🔴 Автоответ остановлен",
        auto_reply_toggle_on: "▶️ Запустить автоответ",
        auto_reply_toggle_off: "⏹ Остановить автоответ",
        auto_reply_enabled: "✅ Автоответ включен.",
        auto_reply_disabled: "✅ Автоответ выключен."
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
  try { 
      const res = await fetch(`${FIREBASE_URL}/${path}.json`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); 
      if (!res.ok) {
          console.error("🔥 Firebase Yazma Xətası:", await res.text());
      }
  } catch (e) { console.error(e); }
}

const defaultAboutText = `👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔

🌐 𝐒𝐈𝐓𝐄: www.elitebot.com
🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅
👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+
━━━━━━━━━━━━━━━━━━

🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ
🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ
⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋
━━━━━━━━━━━━━━━━━━

💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅𝐈𝐘𝐀𝐓𝐋𝐀𝐑

📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:
📢 @EliteBotMedia
━━━━━━━━━━━━━━━━━━

🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ

📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:
🔗 www.elitebot.com
━━━━━━━━━━━━━━━━━━

🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌

👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅
💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya
📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅
━━━━━━━━━━━━━━━━━━

⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.`;

let currentDesc = "", currentShortDesc = "", lastProfilePhoto = null;
setInterval(async () => {
    try {
        const settings = await getDB('settings') || {};
        const descToSet = settings.botDescription || defaultAboutText;
        if (descToSet !== currentDesc) {
            currentDesc = descToSet;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ description: descToSet })
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
            } catch (e) {}
        }
    } catch (e) {}
}, 15000);

async function isSubscribed(userId, settings) {
  const channelIds = [settings.channel1_id, settings.channel2_id].filter(id => id && String(id).trim() !== "");
  if (channelIds.length === 0) return true;
  for (const chId of channelIds) {
    try {
      const member = await bot.getChatMember(chId.trim(), userId);
      if (!["member", "administrator", "creator"].includes(member.status)) return false;
    } catch (err) {
      return false;
    }
  }
  return true;
}

async function resolveTargetEntity(client, rawTarget) {
  let g = String(rawTarget).trim();
  if (g.startsWith("chat:")) return parseInt(g.slice(5));
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
  if (typeof resolved === 'number' || (typeof resolved === 'object' && resolved.id)) return resolved;
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
    try {
        const user = await getDB(`users/${chatId}`) || {};
        const settings = await getDB('settings') || {};
        const inline_keyboard = [];

        let hasValidLicense = false;
        if (user.activeLicense) {
            const lic = await getDB(`licenses/${user.activeLicense}`);
            hasValidLicense = !!(lic && lic.active);
        }

        const aboutText = t('about', lang);

        if (!hasValidLicense) {
            inline_keyboard.push([
                { text: t('btn_act_lic', lang), callback_data: "enter_license" },
                { text: t('btn_buy_lic', lang), url: "https://t.me/ELITEBOTMEDYA" }
            ]);
            inline_keyboard.push([
                { text: t('btn_price', lang), url: "https://t.me/EliteBotMedia" },
                { text: t('btn_web', lang), url: settings.webUrl || "https://EliteBot.com" }
            ]);
            inline_keyboard.push([
                { text: "💬 WhatsApp Dəstək", url: "https://wa.me/19048477074" }
            ]);
        } else {
            inline_keyboard.push([
                { text: t('btn_add_num', lang), callback_data: "add_new_number" },
                { text: t('btn_manage', lang), callback_data: "manage_numbers" }
            ]);
            inline_keyboard.push([
                { text: t('auto_reply_btn', lang), callback_data: "auto_reply_menu" },
                { text: t('btn_price', lang), url: "https://t.me/EliteBotMedia" }
            ]);
            inline_keyboard.push([
                { text: t('btn_buy_lic', lang), url: "https://t.me/ELITEBOTMEDYA" },
                { text: t('btn_web', lang), url: settings.webUrl || "https://EliteBot.com" }
            ]);
            inline_keyboard.push([
                { text: "💬 WhatsApp Dəstək", url: "https://wa.me/19048477074" }
            ]);
        }

        await sendOrUpdateScreen(chatId, aboutText, { reply_markup: { inline_keyboard } });
    } catch (e) { console.error("showMainMenu xətası:", e); }
}

bot.onText(/\/start/, async (msg) => {
  try {
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
  } catch (e) { console.error("/start xətası:", e); }
});

bot.on('callback_query', async (query) => {
  try {
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
      const ch1 = settings.channel1 || "https://t.me/EliteBotDestek";
      const ch2 = settings.channel2 || "https://t.me/EliteBotMedia";
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
        const ch1 = settings.channel1 || "https://t.me/EliteBotDestek";
        const ch2 = settings.channel2 || "https://t.me/EliteBotMedia";
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
        if (!user || !user.activeLicense) {
            await sendOrUpdateScreen(chatId, t('no_lic', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
        const lic = await getDB(`licenses/${user.activeLicense}`);
        if (!lic || !lic.active) {
            await sendOrUpdateScreen(chatId, t('blocked_lic', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
        const accountsCount = user.accounts ? Object.keys(user.accounts).length : 0;
        if (accountsCount >= lic.maxAccounts) {
           await sendOrUpdateScreen(chatId, t('limit_reached', userLang, { max: lic.maxAccounts }), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
           return;
        }
        await setDB(`users/${chatId}/state`, "AWAITING_PHONE");
        const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
        return sendOrUpdateScreen(chatId, t('enter_phone', userLang), { reply_markup: keyboard });
    }

    if (data === "manage_numbers") {
        const user = await getDB(`users/${chatId}`);
        if (!user || !user.accounts) {
            await sendOrUpdateScreen(chatId, t('no_numbers', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
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
              { text: t('scan_btn', userLang), callback_data: `scan_${phone}` },
              { text: t('change_interval_btn', userLang), callback_data: `chint_${phone}` }
            ]);
            inline_keyboard.push([
              { text: (acc.status === "ACTIVE" ? t('stop_btn', userLang) : t('resume_btn', userLang)), callback_data: `toggle_${phone}` },
              { text: t('delete_btn', userLang), callback_data: `delete_${phone}` }
            ]);
        }
        inline_keyboard.push([{ text: t('back_main', userLang), callback_data: "back_to_main" }]);
        return sendOrUpdateScreen(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
    }

    // Avtocavab menyusu
    if (data === "auto_reply_menu") {
        const user = await getDB(`users/${chatId}`);
        const isEnabled = user?.autoReplyEnabled || false;
        const currentMsg = user?.autoReplyMessage || "Təyin edilməyib";
        const statusText = isEnabled ? t('auto_reply_on', userLang) : t('auto_reply_off', userLang);
        const toggleText = isEnabled ? t('auto_reply_toggle_off', userLang) : t('auto_reply_toggle_on', userLang);
        const toggleData = isEnabled ? "auto_reply_disable" : "auto_reply_enable";
        const keyboard = {
            inline_keyboard: [
                [{ text: "📝 Mesajı Dəyiş", callback_data: "auto_reply_set" }],
                [{ text: toggleText, callback_data: toggleData }],
                [{ text: t('back_main', userLang), callback_data: "back_to_main" }]
            ]
        };
        return sendOrUpdateScreen(chatId, `📩 *Avtomatik Cavab*\n\nStatus: ${statusText}\nCavab mətni:\n${currentMsg}`, { parse_mode: "Markdown", reply_markup: keyboard });
    }

    if (data === "auto_reply_set") {
        await setDB(`users/${chatId}/state`, "AWAITING_AUTO_REPLY");
        const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_main', userLang), callback_data: "back_to_main" }]] };
        return sendOrUpdateScreen(chatId, t('set_auto_reply', userLang), { reply_markup: keyboard });
    }

    if (data === "auto_reply_enable") {
        await setDB(`users/${chatId}/autoReplyEnabled`, true);
        await sendOrUpdateScreen(chatId, t('auto_reply_enabled', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
    }

    if (data === "auto_reply_disable") {
        await setDB(`users/${chatId}/autoReplyEnabled`, false);
        await sendOrUpdateScreen(chatId, t('auto_reply_disabled', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
    }

    if (data.startsWith("toggle_")) {
        const phoneKey = data.replace("toggle_", "");
        const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
        if (acc) {
          const newStatus = acc.status === "ACTIVE" ? "STOPPED" : "ACTIVE";
          await setDB(`users/${chatId}/accounts/${phoneKey}/status`, newStatus);
          bot.sendMessage(chatId, newStatus === "STOPPED" ? t('stop_single', userLang, { phone: phoneKey }) : t('resume_single', userLang, { phone: phoneKey })).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 5000));
          return bot.emit('callback_query', { message: query.message, data: 'manage_numbers', id: query.id, from: query.from });
        }
        return showMainMenu(chatId, userLang);
    }

    if (data.startsWith("chint_")) {
        const phoneKey = data.replace("chint_", "");
        await setDB(`users/${chatId}/state`, "AWAITING_CHANGE_INTERVAL");
        await setDB(`users/${chatId}/changingIntervalPhone`, phoneKey);
        const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_btn', userLang), callback_data: "manage_numbers" }]] };
        return sendOrUpdateScreen(chatId, t('new_interval_prompt', userLang), { reply_markup: keyboard });
    }

    if (data.startsWith("scan_")) {
        const phoneKey = data.replace("scan_", "");
        const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
        if (!acc || !acc.telegramSession) {
            await sendOrUpdateScreen(chatId, t('no_numbers', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }

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
            await sendOrUpdateScreen(chatId, t('no_groups_found', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
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
          await sendOrUpdateScreen(chatId, t('err', userLang) + err.message, { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        } finally {
          if (client) { try { await client.disconnect(); } catch (e) {} }
        }
        return;
    }

    if (data.startsWith("scanselect_")) {
        const groupIndex = parseInt(data.split("_")[1]);
        const session = userSessions[chatId];
        if (!session || !session.scanGroups) {
            await sendOrUpdateScreen(chatId, t('session_expired', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
        if (session.scanSelected.has(groupIndex)) {
          session.scanSelected.delete(groupIndex);
        } else {
          session.scanSelected.add(groupIndex);
        }
        return sendScanPage(chatId, userLang);
    }

    if (data === "scan_confirm") {
        const session = userSessions[chatId];
        if (!session || !session.scanGroups) {
          await sendOrUpdateScreen(chatId, t('session_expired', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
          return;
        }
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
        
        // Seçilmiş qruplara "Bot aktivləşdi" mesajı göndər
        if (selectedGroups.length > 0) {
          const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
          if (acc && acc.telegramSession) {
            let tempClient;
            try {
              tempClient = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
              await tempClient.connect();
              for (const g of selectedGroups) {
                try {
                  const entity = await resolveTargetEntity(tempClient, g);
                  if (entity) {
                    await tempClient.sendMessage(entity, { message: "✅ Bot bu qrupa hədəf olaraq əlavə edildi və aktivləşdirildi." });
                  }
                } catch (e) {}
              }
            } catch (e) {} finally {
              if (tempClient) { try { await tempClient.disconnect(); } catch (e) {} }
            }
          }
        }

        await sendOrUpdateScreen(chatId, t('scan_done', userLang, { count: selectedGroups.length }), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
    }

    if (data === "scan_more") {
        if (!userSessions[chatId]) {
            await sendOrUpdateScreen(chatId, t('session_expired', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
        userSessions[chatId].scanPage++;
        return sendScanPage(chatId, userLang);
    }

    if (data === "scan_back") {
        if (!userSessions[chatId]) {
            await sendOrUpdateScreen(chatId, t('session_expired', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
        userSessions[chatId].scanPage--;
        return sendScanPage(chatId, userLang);
    }

    if (data.startsWith("groups_")) {
        const phoneKey = data.replace("groups_", "");
        const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
        if (!acc) {
            await sendOrUpdateScreen(chatId, t('no_numbers', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
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
        bot.sendMessage(chatId, t('group_deleted', userLang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 3000));
        return bot.emit('callback_query', { message: query.message, data: `groups_${phoneKey}`, id: query.id, from: query.from });
    }

    if (data.startsWith("addgroup_")) {
        const phoneKey = data.replace("addgroup_", "");
        await setDB(`users/${chatId}/currentPhoneSetup`, "+" + phoneKey);
        await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
        const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }], [{ text: t('back_btn', userLang), callback_data: `groups_${phoneKey}` }]] };
        return sendOrUpdateScreen(chatId, t('send_group', userLang), { parse_mode: "Markdown", reply_markup: keyboard });
    }

    if (data.startsWith("source_")) {
        const phoneKey = data.replace("source_", "");
        const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
        if (!acc) {
            await sendOrUpdateScreen(chatId, t('no_numbers', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
            return;
        }
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
        bot.sendMessage(chatId, t('source_deleted', userLang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 3000));
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
        bot.sendMessage(chatId, t('num_deleted', userLang, { phone: phoneKey })).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 3000));
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
      await setDB(`users/${chatId}/autoReplyEnabled`, false);
      bot.sendMessage(chatId, t('auto_reply_deleted', userLang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 3000));
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

  } catch (e) {
    console.error("Callback xətası:", e);
  }
});

async function sendScanPage(chatId, lang) {
  try {
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
  } catch (e) { console.error("sendScanPage xətası:", e); }
}

bot.on('message', async (msg) => {
  try {
    if (!msg.text || msg.text.startsWith('/')) {
      const chatId = msg.chat.id;
      const user = await getDB(`users/${chatId}`);
      const state = await getDB(`users/${chatId}/state`);
      // Əgər user bot özü deyilsə və autoReplyEnabled true-dursa, cavab ver
      if (user && user.autoReplyEnabled && user.autoReplyMessage && (!state || state === "IDLE" || state === "START")) {
        // Botun öz mesajlarına cavab verməsin
        const botInfo = await bot.getMe();
        if (msg.from.id !== botInfo.id) {
          bot.sendMessage(chatId, user.autoReplyMessage);
        }
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
      if (isNaN(min) || min < 2 || min > 5) {
        await sendOrUpdateScreen(chatId, t('interval_err', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
      const phoneKey = await getDB(`users/${chatId}/changingIntervalPhone`);
      if (!phoneKey) return showMainMenu(chatId, userLang);
      await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, min);
      await setDB(`users/${chatId}/state`, "IDLE");
      await setDB(`users/${chatId}/changingIntervalPhone`, null);
      bot.sendMessage(chatId, t('interval_updated', userLang, { min })).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 3000));
      return showMainMenu(chatId, userLang);
    }

    if (state === "AWAITING_AUTO_REPLY") {
      await setDB(`users/${chatId}/autoReplyMessage`, text);
      await setDB(`users/${chatId}/autoReplyEnabled`, true);
      await setDB(`users/${chatId}/state`, "IDLE");
      bot.sendMessage(chatId, t('auto_reply_set', userLang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 5000));
      return showMainMenu(chatId, userLang);
    }

    if (state === "AWAITING_LICENSE") {
      if (!text.startsWith("ELITE-")) {
        await sendOrUpdateScreen(chatId, t('invalid_lic', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
      const lic = await getDB(`licenses/${text}`);
      if (!lic) {
        await sendOrUpdateScreen(chatId, t('not_found_lic', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
      if (!lic.active) {
        await sendOrUpdateScreen(chatId, t('blocked_lic', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
      if (lic.usedBy && lic.usedBy !== chatId) {
        await sendOrUpdateScreen(chatId, t('used_lic', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
      if (!lic.usedBy) await setDB(`licenses/${text}/usedBy`, chatId);
      await setDB(`users/${chatId}/activeLicense`, text);
      await setDB(`users/${chatId}/state`, "IDLE");
      bot.sendMessage(chatId, t('success_lic', userLang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(()=>{}), 3000));
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
        await sendOrUpdateScreen(chatId, t('err', userLang) + err.message, { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
      }
      return;
    }

    if (state === "AWAITING_OTP") {
      const rawOtp = text.replace(/\s+/g, '');
      const sessionData = userSessions[chatId];
      if (!sessionData) {
        await sendOrUpdateScreen(chatId, t('sess_lost', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
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
        await sendOrUpdateScreen(chatId, t('otp_err', userLang) + err.message, { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
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
      if (!acc || !acc.telegramSession) {
        await sendOrUpdateScreen(chatId, t('sess_lost', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
      let tempClient;
      try {
        tempClient = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
        await tempClient.connect();
        const sourceEntity = await resolveTargetEntity(tempClient, text);
        await tempClient.getMessages(sourceEntity, { limit: 1 });
      } catch (err) {
        if (tempClient) { try { await tempClient.disconnect(); } catch (e) {} }
        await sendOrUpdateScreen(chatId, t('invalid_source', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
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
      if (isNaN(min) || min < 2 || min > 5) {
        await sendOrUpdateScreen(chatId, t('interval_err', userLang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', userLang), callback_data: "back_to_main" }]] } });
        return;
      }
      const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
      const phoneKey = currentPhone.replace('+', '');
      await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, min);
      await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, Date.now());
      await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "ACTIVE");
      await setDB(`users/${chatId}/state`, "IDLE");
      delete userSessions[chatId];
      return sendOrUpdateScreen(chatId, t('bot_started', userLang, { phone: currentPhone, min: min }), { parse_mode: "Markdown" });
    }

    // Avtomatik cavab (state IDLE olduqda)
    const user = await getDB(`users/${chatId}`);
    if (user && user.autoReplyEnabled && user.autoReplyMessage && (!state || state === "IDLE" || state === "START")) {
      const botInfo = await bot.getMe();
      if (msg.from.id !== botInfo.id) {
        bot.sendMessage(chatId, user.autoReplyMessage);
      }
    }

  } catch (e) {
    console.error("Message handler xətası:", e);
  }
});

// Admin tərəfindən nömrə dəyişməsi üçün monitor
setInterval(async () => {
  try {
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
  } catch (e) { console.error("pendingPhoneChange xətası:", e); }
}, 15000);

// Mesaj göndərmə intervalı
setInterval(async () => {
  try {
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
              // fromPeer düzgün təyin et
              let fromPeer = msgToForward.peerId;
              if (!fromPeer) fromPeer = msgToForward.inputPeer;
              if (!fromPeer) {
                // əgər hələ də yoxdursa, mənbə 'me' ola bilər
                if (source.type !== "custom") fromPeer = 'me';
                else continue;
              }

              for (const g of groups) {
                try {
                  const targetEntity = await getForwardTargetEntity(client, g);
                  await client.forwardMessages(targetEntity, {
                    messages: [msgToForward.id],
                    fromPeer: fromPeer
                  });
                  // hər qrupa göndərdikdən sonra 2-5 dəqiqə gözlə
                  const delay = Math.floor(Math.random() * (4 - 2 + 1) + 2) * 60 * 1000;
                  await new Promise(resolve => setTimeout(resolve, delay));
                } catch (e) { /* fərdi xətaları keç */ }
              }
              await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, Date.now());
            }
          } catch (err) {
            // ümumi xətanı logla, amma dayanma
            console.error("Mesaj göndərmə xətası:", err.message);
          } finally {
            if (client) { try { await client.disconnect(); } catch (e) {} }
          }
      }
    }
  } catch (e) { console.error("interval mesaj göndərmə xətası:", e); }
}, 30000);