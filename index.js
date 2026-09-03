// index.js - TAM YENİ VERSİYA
const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fetch = require('node-fetch');
const http = require('http');

// ============ SERVER ============
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot işləyir.");
}).listen(PORT, () => {
  console.log(`Server ${PORT} portunda işləyir.`);
});

// Render-da botun dayanmaması üçün hər 3 dəqiqədən bir özünə ping
setInterval(() => {
  fetch(`http://localhost:${PORT}`).catch(() => {});
}, 180000);

// ============ KONFİQ ============
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
    about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅İ𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
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
    blocked_lic: "❌ Bu lisenziya bloklanıb.",
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
    scan_confirm: "✅ Seçilmişləri əlavə et",
    scan_more: "⏭ Növbəti",
    scan_back: "⏮ Əvvəlki",
    scan_done: "✅ {count} qrup əlavə edildi.",
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
    auto_reply_disabled: "✅ Avtocavab dayandırıldı."
  },
  tr: {
    about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅𝐈𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
    sub_msg: "Aşağıdaki kanallara abone olun:",
    sub_btn: "✅ Abonelikleri Doğrula",
    checking: "⏳ Abonelik kontrol ediliyor...",
    confirmed: "✅ Doğrulandı!",
    not_subscribed: "❌ Henüz tüm kanallara abone olmadınız!",
    btn_act_lic: "🔑 Lisans Etkinleştir",
    btn_buy_lic: "🛒 Lisans Satın Al / Destek",
    btn_price: "📋 Fiyat Listesi",
    btn_web: "🌐 Web Sitemiz",
    menu_lic: "✅ Lisans Aktif! Ana Menü:",
    btn_add_num: "➕ Yeni Numara Ekle",
    btn_manage: "⚙️ Hesaplarım",
    enter_lic: "Lisans kodunu girin (ELITE-12345):",
    invalid_lic: "❌ Geçersiz kod formatı.",
    not_found_lic: "❌ Lisans bulunamadı.",
    blocked_lic: "❌ Bu lisans engellenmiş.",
    used_lic: "❌ Bu lisans başka kullanıcı tarafından kullanılıyor.",
    success_lic: "✅ Lisans etkinleştirildi!",
    no_lic: "❌ Aktif lisansınız yok.",
    limit_reached: "❌ Lisans limitine ulaştınız (Maks: {max}).",
    enter_phone: "📱 Telegram numaranızı girin (+90501234567):",
    no_numbers: "⚠️ Henüz numara eklenmedi.",
    my_accounts: "⚙️ *Aktif Hesaplarınız:*\n\n",
    stopped: "🔴 Durduruldu",
    active: "🟢 Aktif",
    stop_btn: "⏹ Durdur",
    resume_btn: "▶️ Başlat",
    back_main: "🔙 Ana Menü",
    phone_format: "⚠️ Numara '+' ile başlamalıdır!",
    otp_sent: "⏳ OTP kodu gönderiliyor...",
    otp_info: "📩 Güvenlik kodunu girin (boşlukla):",
    err: "❌ Hata: ",
    sess_lost: "⚠️ Oturum kayboldu. Yeniden başlayın.",
    login_success: "✅ {phone} hesabına giriş yapıldı!\n\nŞimdi grubun kullanıcı adını (@) veya linkini gönderin:",
    otp_err: "❌ OTP yanlış. Hata: ",
    group_added: "✅ Grup eklendi. (Toplam {count} grup)",
    add_more: "➕ Başka grup ekle",
    finish_btn: "✅ Bitir ve Devam Et",
    send_group: "Grubun adını (@) veya linkini gönderin:",
    ask_interval: "✅ İntervalı girin (2-5 dakika):",
    interval_err: "⚠️ 2 ile 5 arası sayı girin.",
    bot_started: "✅ *Bot Başladı ({phone})!*\n\nHer {min} dakikada mesaj gönderilecek.",
    ch1_btn: "📢 Zorunlu Kanal 1",
    ch2_btn: "📢 Zorunlu Kanal 2",
    stop_single: "⏹ +{phone} durduruldu.",
    resume_single: "▶️ +{phone} başlatıldı.",
    source_prompt: "📥 Kaynak seçin:",
    source_saved_btn: "💾 Kaydedilen mesajlar",
    source_custom_btn: "🔗 Özel Kanal/Grup/Bot",
    enter_source: "📢 Kaynak kanalının adını (@) veya linkini gönderin:",
    invalid_source: "❌ Kaynağa erişilemedi.",
    source_set_saved: "✅ Kaynak: Kaydedilen mesajlar.",
    source_set_custom: "✅ Kaynak: {target}",
    cancel_btn: "❌ İptal Et",
    groups_btn: "📋 Grupları Yönet",
    source_btn: "📥 Kaynağı Yönet",
    delete_btn: "🗑 Numarayı Sil",
    back_btn: "🔙 Geri",
    del_group_btn: "❌ Sil: {group}",
    del_source_btn: "❌ Kaynağı sil",
    no_groups: "❌ Hiç grup yok.",
    confirm_delete_num: "❗️ +{phone} silinsin mi?",
    confirm_delete_num_yes: "✅ Evet, sil",
    confirm_delete_num_no: "❌ Hayır",
    num_deleted: "✅ +{phone} silindi.",
    group_deleted: "✅ Grup silindi.",
    source_deleted: "✅ Kaynak silindi.",
    add_group_btn: "➕ Yeni Grup Ekle",
    change_source_btn: "🔄 Kaynağı Değiştir",
    change_interval_btn: "⏱ Aralığı Değiştir",
    auto_reply_btn: "📩 Otomatik Yanıt",
    set_auto_reply: "📩 Otomatik yanıt metnini girin:",
    auto_reply_set: "✅ Otomatik yanıt etkinleştirildi.",
    auto_reply_deleted: "✅ Otomatik yanıt silindi.",
    scan_btn: "🔍 Grup Taraması",
    scanning: "⏳ Taranıyor...",
    select_groups: "📋 Gruplardan seçin. Seçilen: {count}",
    scan_select: "✅ Seç",
    scan_unselect: "❌ Kaldır",
    scan_confirm: "✅ Seçilenleri ekle",
    scan_more: "⏭ Sonraki",
    scan_back: "⏮ Önceki",
    scan_done: "✅ {count} grup eklendi.",
    no_groups_found: "❌ Hiç grup bulunamadı.",
    scan_page: "Sayfa {page}/{total}",
    new_interval_prompt: "⏱ Yeni aralık (2-5):",
    interval_updated: "✅ Aralık {min} dakikaya değiştirildi.",
    session_expired: "⚠️ Oturum süresi doldu. Yeniden tarayın.",
    auto_reply_on: "🟢 Otomatik yanıt aktif",
    auto_reply_off: "🔴 Otomatik yanıt durduruldu",
    auto_reply_toggle_on: "▶️ Başlat",
    auto_reply_toggle_off: "⏹ Durdur",
    auto_reply_enabled: "✅ Otomatik yanıt etkinleştirildi.",
    auto_reply_disabled: "✅ Otomatik yanıt durduruldu."
  },
  en: {
    about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅𝐈𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
    sub_msg: "Please subscribe to the channels below:",
    sub_btn: "✅ Verify Subscriptions",
    checking: "⏳ Checking...",
    confirmed: "✅ Confirmed!",
    not_subscribed: "❌ You haven't subscribed to all channels yet!",
    btn_act_lic: "🔑 Activate License",
    btn_buy_lic: "🛒 Buy License / Support",
    btn_price: "📋 Price List",
    btn_web: "🌐 Our Website",
    menu_lic: "✅ License Active! Main Menu:",
    btn_add_num: "➕ Add New Number",
    btn_manage: "⚙️ My Accounts",
    enter_lic: "Enter license code (ELITE-12345):",
    invalid_lic: "❌ Invalid format.",
    not_found_lic: "❌ License not found.",
    blocked_lic: "❌ This license is blocked.",
    used_lic: "❌ This license is already used.",
    success_lic: "✅ License activated!",
    no_lic: "❌ No active license.",
    limit_reached: "❌ License limit reached (Max: {max}).",
    enter_phone: "📱 Enter your Telegram number (+994501234567):",
    no_numbers: "⚠️ No numbers added yet.",
    my_accounts: "⚙️ *Your Active Accounts:*\n\n",
    stopped: "🔴 Stopped",
    active: "🟢 Active",
    stop_btn: "⏹ Stop",
    resume_btn: "▶️ Start",
    back_main: "🔙 Main Menu",
    phone_format: "⚠️ Number must start with '+'!",
    otp_sent: "⏳ Sending OTP...",
    otp_info: "📩 Enter security code (with spaces):",
    err: "❌ Error: ",
    sess_lost: "⚠️ Session lost. Restart.",
    login_success: "✅ Logged in to {phone}!\n\nNow send the group username (@) or link:",
    otp_err: "❌ OTP incorrect. Error: ",
    group_added: "✅ Group added. (Total {count} groups)",
    add_more: "➕ Add another group",
    finish_btn: "✅ Finish and Continue",
    send_group: "Send group username (@) or link:",
    ask_interval: "✅ Enter interval (2-5 minutes):",
    interval_err: "⚠️ Enter number between 2 and 5.",
    bot_started: "✅ *Bot Started ({phone})!*\n\nSending every {min} minutes.",
    ch1_btn: "📢 Mandatory Channel 1",
    ch2_btn: "📢 Mandatory Channel 2",
    stop_single: "⏹ +{phone} stopped.",
    resume_single: "▶️ +{phone} started.",
    source_prompt: "📥 Select source:",
    source_saved_btn: "💾 Saved messages",
    source_custom_btn: "🔗 Custom Channel/Group/Bot",
    enter_source: "📢 Send source username (@) or link:",
    invalid_source: "❌ Cannot access source.",
    source_set_saved: "✅ Source: Saved messages.",
    source_set_custom: "✅ Source: {target}",
    cancel_btn: "❌ Cancel",
    groups_btn: "📋 Manage Groups",
    source_btn: "📥 Manage Source",
    delete_btn: "🗑 Delete Number",
    back_btn: "🔙 Back",
    del_group_btn: "❌ Delete: {group}",
    del_source_btn: "❌ Delete source",
    no_groups: "❌ No groups.",
    confirm_delete_num: "❗️ Delete +{phone}?",
    confirm_delete_num_yes: "✅ Yes, delete",
    confirm_delete_num_no: "❌ No",
    num_deleted: "✅ +{phone} deleted.",
    group_deleted: "✅ Group deleted.",
    source_deleted: "✅ Source deleted.",
    add_group_btn: "➕ Add New Group",
    change_source_btn: "🔄 Change Source",
    change_interval_btn: "⏱ Change Interval",
    auto_reply_btn: "📩 Auto Reply",
    set_auto_reply: "📩 Enter auto-reply message:",
    auto_reply_set: "✅ Auto-reply activated.",
    auto_reply_deleted: "✅ Auto-reply deleted.",
    scan_btn: "🔍 Group Scan",
    scanning: "⏳ Scanning...",
    select_groups: "📋 Select groups. Selected: {count}",
    scan_select: "✅ Select",
    scan_unselect: "❌ Remove",
    scan_confirm: "✅ Add selected",
    scan_more: "⏭ Next",
    scan_back: "⏮ Previous",
    scan_done: "✅ {count} groups added.",
    no_groups_found: "❌ No groups found.",
    scan_page: "Page {page}/{total}",
    new_interval_prompt: "⏱ New interval (2-5):",
    interval_updated: "✅ Interval changed to {min} minutes.",
    session_expired: "⚠️ Session expired. Scan again.",
    auto_reply_on: "🟢 Auto-reply active",
    auto_reply_off: "🔴 Auto-reply stopped",
    auto_reply_toggle_on: "▶️ Start",
    auto_reply_toggle_off: "⏹ Stop",
    auto_reply_enabled: "✅ Auto-reply enabled.",
    auto_reply_disabled: "✅ Auto-reply disabled."
  },
  ru: {
    about: "👑 𝐄𝐋𝐈𝐓𝐄 𝐎𝐓𝐎𝐌𝐄𝐒𝐀𝐉 𝐁𝐎𝐓𝐔\n\n🌐 𝐒𝐈𝐓𝐄: www.elitebot.com\n🛡️ 𝐑𝐄𝐒𝐌Î 𝐘Ö𝐍𝐄𝐓İ𝐂İ: @EliteNetworkk ✅\n👥 𝐀𝐊𝐓İ𝐅 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐂𝐈: 𝟏𝟎𝟎𝟎+\n━━━━━━━━━━━━━━━━━━\n\n🚀 𝐌𝐎𝐁İ𝐋 & 𝐁İ𝐋𝐆İ𝐒𝐀𝐘𝐀𝐑 𝐃𝐄𝐒𝐓𝐄𝐊𝐋İ\n🤖 𝐎𝐓𝐎𝐌𝐀𝐓İ𝐊 𝐌𝐄𝐒𝐀𝐉 𝐒İ𝐒𝐓𝐄𝐌İ\n⚡ 𝐇ı𝐙𝐋𝐈 • 𝐆Ü𝐕𝐄𝐍𝐋İ • 𝐏𝐑𝐎𝐅𝐄𝐒𝐘𝐎𝐍𝐄𝐋\n━━━━━━━━━━━━━━━━━━\n\n💎 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ & 𝐅𝐈𝐘𝐀𝐓𝐋𝐀𝐑\n\n📌 𝐆Ü𝐍𝐂𝐄𝐋 𝐋İ𝐒𝐀𝐍𝐒 𝐏𝐀𝐊𝐄𝐓𝐋𝐄𝐑İ, 𝐊𝐀𝐌𝐏𝐀𝐍𝐘𝐀𝐋𝐀𝐑 𝐕𝐄 𝐅𝐈𝐘𝐀𝐓 𝐃𝐄𝐓𝐀𝐘𝐋𝐀𝐑𝐈:\n📢 @EliteBotMedia\n━━━━━━━━━━━━━━━━━━\n\n🌍 𝐁𝐎𝐓 𝐇𝐀𝐊𝐊𝐈𝐍𝐃𝐀 𝐃𝐄𝐓𝐀𝐘𝐋𝐈 𝐁İ𝐋𝐆İ\n\n📖 𝐓Ü𝐌 Ö𝐙𝐄𝐋𝐋İ𝐊𝐋𝐄𝐑, 𝐊𝐔𝐋𝐋𝐀𝐍𝐈𝐌 𝐑𝐄𝐇𝐁𝐄𝐑İ 𝐕𝐄 𝐆Ü𝐍𝐂𝐄𝐋 𝐒Ü𝐑Ü𝐌𝐋𝐄𝐑:\n🔗 www.elitebot.com\n━━━━━━━━━━━━━━━━━━\n\n🛒 𝐒𝐀𝐓𝐈𝐍 𝐀𝐋𝐌𝐀 & 𝐈𝐋𝐄𝐓İŞİ𝐌\n\n👤 𝐒𝐀𝐓𝐈Ş 𝐘𝐄𝐓𝐊İ𝐋𝐈𝐒İ: @EliteNetworkk ✅\n💬 𝐃𝐄𝐒𝐓𝐄𝐊 𝐇𝐀𝐓𝐓𝐈: @EliteBotMedya\n📣 𝐑𝐄𝐒𝐌Î 𝐑𝐄𝐅 𝐊𝐀𝐍𝐀𝐋𝐈: @EliteBotMedia ✅\n━━━━━━━━━━━━━━━━━━\n\n⚠️ 𝐋Ü𝐓𝐅𝐄𝐍 Ö𝐃𝐄𝐌𝐄 𝐘𝐀𝐏𝐌𝐀𝐃𝐀𝐍 Ö𝐍𝐂𝐄 𝐒𝐀𝐃𝐄𝐂𝐄 𝐑𝐄𝐒𝐌Î 𝐇𝐄𝐒𝐀𝐏𝐋𝐀𝐑𝐈𝐌𝐈𝐙𝐈 𝐃𝐎Ğ𝐑𝐔𝐋𝐀𝐘𝐀𝐑𝐀𝐊 İŞ𝐋𝐄𝐌 𝐘𝐀𝐏𝐈𝐍𝐈𝐙.",
    sub_msg: "Подпишитесь на каналы ниже:",
    sub_btn: "✅ Подтвердить подписку",
    checking: "⏳ Проверка...",
    confirmed: "✅ Подтверждено!",
    not_subscribed: "❌ Вы еще не подписались на все каналы!",
    btn_act_lic: "🔑 Активировать лицензию",
    btn_buy_lic: "🛒 Купить лицензию / Поддержка",
    btn_price: "📋 Прайс-лист",
    btn_web: "🌐 Наш сайт",
    menu_lic: "✅ Лицензия активна! Главное меню:",
    btn_add_num: "➕ Добавить новый номер",
    btn_manage: "⚙️ Мои аккаунты",
    enter_lic: "Введите код лицензии (ELITE-12345):",
    invalid_lic: "❌ Неверный формат.",
    not_found_lic: "❌ Лицензия не найдена.",
    blocked_lic: "❌ Лицензия заблокирована.",
    used_lic: "❌ Лицензия уже используется.",
    success_lic: "✅ Лицензия активирована!",
    no_lic: "❌ Нет активной лицензии.",
    limit_reached: "❌ Достигнут лимит (Макс: {max}).",
    enter_phone: "📱 Введите номер Telegram (+994501234567):",
    no_numbers: "⚠️ Номера не добавлены.",
    my_accounts: "⚙️ *Ваши активные аккаунты:*\n\n",
    stopped: "🔴 Остановлено",
    active: "🟢 Активно",
    stop_btn: "⏹ Остановить",
    resume_btn: "▶️ Запустить",
    back_main: "🔙 Главное меню",
    phone_format: "⚠️ Номер должен начинаться с '+'!",
    otp_sent: "⏳ Отправка OTP...",
    otp_info: "📩 Введите код безопасности (с пробелами):",
    err: "❌ Ошибка: ",
    sess_lost: "⚠️ Сессия потеряна. Перезапустите.",
    login_success: "✅ Вход в {phone} выполнен!\n\nТеперь отправьте имя группы (@) или ссылку:",
    otp_err: "❌ OTP неверен. Ошибка: ",
    group_added: "✅ Группа добавлена. (Всего {count} групп)",
    add_more: "➕ Добавить другую группу",
    finish_btn: "✅ Завершить и продолжить",
    send_group: "Отправьте имя группы (@) или ссылку:",
    ask_interval: "✅ Введите интервал (2-5 минут):",
    interval_err: "⚠️ Введите число от 2 до 5.",
    bot_started: "✅ *Бот запущен ({phone})!*\n\nОтправка каждые {min} минут.",
    ch1_btn: "📢 Обязательный канал 1",
    ch2_btn: "📢 Обязательный канал 2",
    stop_single: "⏹ +{phone} остановлен.",
    resume_single: "▶️ +{phone} запущен.",
    source_prompt: "📥 Выберите источник:",
    source_saved_btn: "💾 Сохраненные сообщения",
    source_custom_btn: "🔗 Пользовательский канал/Группа/Бот",
    enter_source: "📢 Отправьте имя канала (@) или ссылку:",
    invalid_source: "❌ Не удалось получить доступ.",
    source_set_saved: "✅ Источник: Сохраненные сообщения.",
    source_set_custom: "✅ Источник: {target}",
    cancel_btn: "❌ Отмена",
    groups_btn: "📋 Управление группами",
    source_btn: "📥 Управление источником",
    delete_btn: "🗑 Удалить номер",
    back_btn: "🔙 Назад",
    del_group_btn: "❌ Удалить: {group}",
    del_source_btn: "❌ Удалить источник",
    no_groups: "❌ Нет групп.",
    confirm_delete_num: "❗️ Удалить +{phone}?",
    confirm_delete_num_yes: "✅ Да, удалить",
    confirm_delete_num_no: "❌ Нет",
    num_deleted: "✅ +{phone} удален.",
    group_deleted: "✅ Группа удалена.",
    source_deleted: "✅ Источник удален.",
    add_group_btn: "➕ Добавить новую группу",
    change_source_btn: "🔄 Изменить источник",
    change_interval_btn: "⏱ Изменить интервал",
    auto_reply_btn: "📩 Автоответ",
    set_auto_reply: "📩 Введите текст автоответа:",
    auto_reply_set: "✅ Автоответ активирован.",
    auto_reply_deleted: "✅ Автоответ удален.",
    scan_btn: "🔍 Сканирование групп",
    scanning: "⏳ Сканирование...",
    select_groups: "📋 Выберите группы. Выбрано: {count}",
    scan_select: "✅ Выбрать",
    scan_unselect: "❌ Удалить",
    scan_confirm: "✅ Добавить выбранные",
    scan_more: "⏭ Следующая",
    scan_back: "⏮ Предыдущая",
    scan_done: "✅ {count} групп добавлено.",
    no_groups_found: "❌ Групп не найдено.",
    scan_page: "Страница {page}/{total}",
    new_interval_prompt: "⏱ Новый интервал (2-5):",
    interval_updated: "✅ Интервал изменен на {min} минут.",
    session_expired: "⚠️ Сессия истекла. Отсканируйте заново.",
    auto_reply_on: "🟢 Автоответ активен",
    auto_reply_off: "🔴 Автоответ остановлен",
    auto_reply_toggle_on: "▶️ Запустить",
    auto_reply_toggle_off: "⏹ Остановить",
    auto_reply_enabled: "✅ Автоответ включен.",
    auto_reply_disabled: "✅ Автоответ выключен."
  }
};

function t(key, lang = 'az') {
  return langData[lang]?.[key] || langData['az'][key] || key;
}

// ============ DEFAULT SETTINGS ============
(async function initSettings() {
  const settings = await getDB('settings');
  if (!settings) {
    await setDB('settings', {
      channel1: "https://t.me/EliteBotDestek",
      channel2: "https://t.me/EliteBotMedia",
      channel1_id: "@EliteBotDestek",
      channel2_id: "@EliteBotMedia",
      webUrl: "https://EliteBot.com"
    });
  }
})();

// ============ YARDIMÇI FUNKSİYALAR ============
const userStates = {}; // { chatId: state }
const userSessions = {}; // { chatId: { client, phone, hash } }
const mainMsgIds = {}; // { chatId: messageId }

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
    licActive = !!(lic && lic.active);
  }

  const keyboard = [];
  if (!licActive) {
    keyboard.push([
      { text: t('btn_act_lic', lang), callback_data: 'enter_license' },
      { text: t('btn_buy_lic', lang), url: 'https://t.me/ELITEBOTMEDYA' }
    ]);
    keyboard.push([
      { text: t('btn_price', lang), url: 'https://t.me/EliteBotMedia' },
      { text: t('btn_web', lang), url: 'https://EliteBot.com' }
    ]);
    keyboard.push([
      { text: '💬 WhatsApp Dəstək', url: 'https://wa.me/19048477074' }
    ]);
  } else {
    keyboard.push([
      { text: t('btn_add_num', lang), callback_data: 'add_new_number' },
      { text: t('btn_manage', lang), callback_data: 'manage_numbers' }
    ]);
    keyboard.push([
      { text: t('auto_reply_btn', lang), callback_data: 'auto_reply_menu' },
      { text: t('btn_price', lang), url: 'https://t.me/EliteBotMedia' }
    ]);
    keyboard.push([
      { text: t('btn_buy_lic', lang), url: 'https://t.me/ELITEBOTMEDYA' },
      { text: t('btn_web', lang), url: 'https://EliteBot.com' }
    ]);
    keyboard.push([
      { text: '💬 WhatsApp Dəstək', url: 'https://wa.me/19048477074' }
    ]);
  }

  const aboutText = t('about', lang);
  await sendOrUpdate(chatId, aboutText, { reply_markup: { inline_keyboard: keyboard } });
}

async function isSubscribed(userId) {
  const settings = await getDB('settings');
  const channels = [settings?.channel1_id, settings?.channel2_id].filter(Boolean);
  if (channels.length === 0) return true;
  for (const ch of channels) {
    try {
      const member = await bot.getChatMember(ch.trim(), userId);
      if (!['member', 'administrator', 'creator'].includes(member.status)) return false;
    } catch (e) {
      return false;
    }
  }
  return true;
}

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

// ============ BOT KOMANDALARI ============
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  mainMsgIds[chatId] = undefined;
  await setDB(`users/${chatId}/state`, 'START');

  const keyboard = {
    inline_keyboard: [
      [{ text: '🇦🇿 Azərbaycan', callback_data: 'lang_az' }, { text: '🇹🇷 Türkçe', callback_data: 'lang_tr' }],
      [{ text: '🇬🇧 English', callback_data: 'lang_en' }, { text: '🇷🇺 Русский', callback_data: 'lang_ru' }]
    ]
  };
  const sent = await bot.sendMessage(chatId, 'Dil seçin:', { reply_markup: keyboard });
  mainMsgIds[chatId] = sent.message_id;
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const user = await getDB(`users/${chatId}`) || {};
  const lang = user.lang || 'az';
  await bot.answerCallbackQuery(query.id);

  // Dil seçimi
  if (data.startsWith('lang_')) {
    const newLang = data.split('_')[1];
    await setDB(`users/${chatId}/lang`, newLang);
    const settings = await getDB('settings') || {};
    const keyboard = {
      inline_keyboard: [
        [{ text: t('ch1_btn', newLang), url: settings.channel1 || 'https://t.me/EliteBotDestek' }],
        [{ text: t('ch2_btn', newLang), url: settings.channel2 || 'https://t.me/EliteBotMedia' }],
        [{ text: t('sub_btn', newLang), callback_data: 'check_sub' }],
        [{ text: t('back_main', newLang), callback_data: 'back_to_main' }]
      ]
    };
    await sendOrUpdate(chatId, t('sub_msg', newLang), { reply_markup: keyboard });
    return;
  }

  if (data === 'check_sub') {
    const wait = await bot.sendMessage(chatId, t('checking', lang));
    const ok = await isSubscribed(query.from.id);
    await bot.deleteMessage(chatId, wait.message_id).catch(() => {});
    if (ok) {
      await showMainMenu(chatId);
    } else {
      const settings = await getDB('settings') || {};
      const keyboard = {
        inline_keyboard: [
          [{ text: t('ch1_btn', lang), url: settings.channel1 || 'https://t.me/EliteBotDestek' }],
          [{ text: t('ch2_btn', lang), url: settings.channel2 || 'https://t.me/EliteBotMedia' }],
          [{ text: t('sub_btn', lang), callback_data: 'check_sub' }],
          [{ text: t('back_main', lang), callback_data: 'back_to_main' }]
        ]
      };
      await sendOrUpdate(chatId, t('not_subscribed', lang), { reply_markup: keyboard });
    }
    return;
  }

  if (data === 'back_to_main' || data === 'cancel_operation') {
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, 'IDLE');
    await showMainMenu(chatId);
    return;
  }

  // Lisenziya aktivləşdirmə
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

  // Yeni nömrə əlavə et
  if (data === 'add_new_number') {
    const userData = await getDB(`users/${chatId}`);
    if (!userData?.activeLicense) {
      await sendOrUpdate(chatId, t('no_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
    const lic = await getDB(`licenses/${userData.activeLicense}`);
    if (!lic?.active) {
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

  // Hesablarım
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
    kb.push([{ text: t('back_main', lang), callback_data: 'back_to_main' }]);
    await sendOrUpdate(chatId, msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: kb } });
    return;
  }

  // Avtocavab menyusu
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

  // Dayandır / Başlat
  if (data.startsWith('toggle_')) {
    const phone = data.replace('toggle_', '');
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (acc) {
      const newStatus = acc.status === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
      await setDB(`users/${chatId}/accounts/${phone}/status`, newStatus);
      const msg = newStatus === 'STOPPED' ? t('stop_single', lang, { phone }) : t('resume_single', lang, { phone });
      bot.sendMessage(chatId, msg).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 5000));
      // Yenidən manage_numbers səhifəsini göstər
      await bot.emit('callback_query', { message: query.message, data: 'manage_numbers', id: query.id, from: query.from });
    }
    return;
  }

  // Interval dəyiş
  if (data.startsWith('chint_')) {
    const phone = data.replace('chint_', '');
    await setDB(`users/${chatId}/state`, 'AWAITING_CHANGE_INTERVAL');
    await setDB(`users/${chatId}/changingIntervalPhone`, phone);
    const kb = { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: 'cancel_operation' }]] };
    await sendOrUpdate(chatId, t('new_interval_prompt', lang), { reply_markup: kb });
    return;
  }

  // Qrup skanı
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
      client = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
      await client.connect();
      const dialogs = await client.getDialogs({ limit: 200 });
      const groups = dialogs.filter(d => d.isGroup || d.isChannel).map(d => ({
        id: d.id,
        title: d.title || 'Bilinməyən',
        username: d.username || ''
      }));
      await bot.deleteMessage(chatId, wait.message_id).catch(() => {});
      if (groups.length === 0) {
        await sendOrUpdate(chatId, t('no_groups_found', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      userSessions[chatId] = {
        scanGroups: groups,
        scanSelected: new Set(),
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
      return g.username ? `@${g.username}` : `chat:${g.id}`;
    });
    const existing = await getDB(`users/${chatId}/accounts/${phone}/targetGroups`) || [];
    const merged = [...new Set([...existing, ...selected])];
    await setDB(`users/${chatId}/accounts/${phone}/targetGroups`, merged);
    delete userSessions[chatId];

    // Seçilmiş qruplara mesaj göndər
    if (selected.length > 0) {
      const acc = await getDB(`users/${chatId}/accounts/${phone}`);
      if (acc?.telegramSession) {
        let cl;
        try {
          cl = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
          await cl.connect();
          for (const g of selected) {
            try {
              const entity = await resolveEntity(cl, g);
              if (entity) await cl.sendMessage(entity, { message: '✅ Bot bu qrupa əlavə edildi və aktivləşdirildi.' });
            } catch (e) {}
          }
        } catch (e) {} finally { if (cl) try { await cl.disconnect(); } catch (e) {} }
      }
    }
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

  // Qrupları idarə et
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
    if (groups.length === 0) msg += t('no_groups', lang);
    else {
      groups.forEach((g, i) => {
        msg += `${i+1}. ${g}\n`;
        kb.push([{ text: t('del_group_btn', lang, { group: g.substring(0, 20) }), callback_data: `delgroup_${phone}_${i}` }]);
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

  // Mənbə idarə et
  if (data.startsWith('source_')) {
    const phone = data.replace('source_', '');
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (!acc) {
      await sendOrUpdate(chatId, t('no_numbers', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
      return;
    }
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

  // Silmə
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
    const userData = await getDB(`users/${chatId}`);
    if (userData?.activeLicense) {
      await setDB(`licenses/${userData.activeLicense}/registeredPhones/${phone}`, null);
    }
    bot.sendMessage(chatId, t('num_deleted', lang, { phone })).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, 'IDLE');
    await showMainMenu(chatId);
    return;
  }

  // Qrup əlavə etmə davamı
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
    kb.inline_keyboard.push([{ text: `${emoji} ${g.title.substring(0, 25)}`, callback_data: `scanselect_${idx}` }]);
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

    // Avtomatik cavab
    if (user.autoReplyEnabled && user.autoReplyMessage && (state === 'IDLE' || state === 'START')) {
      await bot.sendMessage(chatId, user.autoReplyMessage);
      return;
    }

    const text = msg.text.trim();

    // Ləğv et
    if (text === t('cancel_btn', lang)) {
      delete userSessions[chatId];
      await setDB(`users/${chatId}/state`, 'IDLE');
      await showMainMenu(chatId);
      return;
    }

    // Lisenziya daxil et
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
      if (!lic.usedBy) await setDB(`licenses/${text}/usedBy`, chatId);
      await setDB(`users/${chatId}/activeLicense`, text);
      await setDB(`users/${chatId}/state`, 'IDLE');
      bot.sendMessage(chatId, t('success_lic', lang)).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
      await showMainMenu(chatId);
      return;
    }

    // Nömrə daxil et
    if (state === 'AWAITING_PHONE') {
      if (!text.startsWith('+')) {
        await sendOrUpdate(chatId, t('phone_format', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      const wait = await bot.sendMessage(chatId, t('otp_sent', lang));
      try {
        const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, { connectionRetries: 5 });
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

    // OTP daxil et
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

    // Qrup əlavə et
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

    // Xüsusi mənbə
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
        cl = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
        await cl.connect();
        const entity = await resolveEntity(cl, text);
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

    // Interval
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
        await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, Date.now());
        await setDB(`users/${chatId}/accounts/${phone}/status`, 'ACTIVE');
        await setDB(`users/${chatId}/state`, 'IDLE');
        delete userSessions[chatId];
        await sendOrUpdate(chatId, t('bot_started', lang, { phone: `+${phone}`, min }), { parse_mode: 'Markdown' });
      }
      return;
    }

    // Avtomatik cavab mətni
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

// ============ MESAJ GÖNDƏRMƏ INTERVALI ============
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

        let client;
        try {
          client = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 3 });
          await client.connect();
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
            const fromPeer = msg.peerId || msg.inputPeer || 'me';
            for (const g of groups) {
              try {
                const target = await resolveEntity(client, g);
                if (target) {
                  // Yeni mesaj kimi göndər (forward deyil)
                  await client.sendMessage(target, { message: msg.text || msg.message || 'Mesaj' });
                }
              } catch (e) {}
            }
            await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, Date.now());
          }
        } catch (e) {
          console.error('Göndərmə xətası:', e.message);
        } finally {
          if (client) try { await client.disconnect(); } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.error('Interval xətası:', e);
  }
}, 30000);

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
          const client = new TelegramClient(new StringSession(''), API_ID, API_HASH, { connectionRetries: 3 });
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

console.log('✅ EliteBot tam işə düşdü!');