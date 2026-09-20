// index.js - RENDER ÜÇÜN TAM OPTİMİZƏ EDİLMİŞ SÜRƏTLİ VERSİYA
const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Logger } = require('telegram/extensions');
const fetch = require('node-fetch');
const http = require('http');

// Uncaught exception və unhandled rejection qoruyucuları (Çökmənin qarşısını almaq üçün)
process.on('uncaughtException', (err) => {
  console.error('Kritik Xəta (Uncaught Exception):', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Tutulmayan Xəta (Unhandled Rejection):', reason);
});

// GramJS-in terminalı doldurub Render-i yavaşlatmasının qarşısını alırıq
Logger.setLevel('none');

// ============ SERVER ============
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot isleyir.");
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda isleyir.`);
});

// Render-da botun dayanmaması üçün hər 3 dəqiqədən bir özünə ping
setInterval(() => {
  fetch(`http://0.0.0.0:${PORT}`).catch(() => {});
}, 180000);

// ============ KONFİQ ============
const BOT_TOKEN = "8973379504:AAEGZlWa5_0pC-GL2oOvUXfIefyPT1GeXiY";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://botadmin-53dc8-default-rtdb.europe-west1.firebasedatabase.app";
const SUPPORT_URL = "https://t.me/EliteBotSupport";
const ALL_BOTS_URL = "https://t.me/+1MsfqoAHmaQ1ZTli";
const DEFAULT_TOURS_BEFORE_PAUSE = 5;
const DEFAULT_PAUSE_MINUTES = 30;
const DEFAULT_AUTOREPLY_COOLDOWN_DAYS = 4;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("Bot işə düşdü və polling başladı...");

// İnternet qırılmalarında botun çökməsinin qarşısını alan xəta tutucu
bot.on('polling_error', (error) => {
  console.log('Polling xətası yarandı, amma bot işləməyə davam edir:', error.message);
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
    blocked_lic: "❌ Bu lisenziya bloklanıb və ya müddəti bitib.",
    used_lic: "❌ Bu lisenziya başqa istifadəçi tərəfindən istifadə olunur.",
    success_lic: "✅ Lisenziya uğurla aktivləşdirildi!",
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
    ask_interval: "✅ İntervalı daxil edin (120-300 saniyə):",
    interval_err: "⚠️ 120 ilə 300 arası rəqəm daxil edin.",
    ch1_btn: "📢 Məcburi Kanal 1",
    ch2_btn: "📢 Məcburi Kanal 2",
    stop_single: "⏹ +{phone} dayandırıldı.",
    resume_single: "▶️ +{phone} başladı və mesaj göndərimi aktiv oldu.",
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
    scan_done: "✅ {count} qrup seçildi. İdarə panelindən 'Başlat' vuraraq işə sala bilərsiniz.",
    no_groups_found: "❌ Heç bir qrup tapılmadı.",
    scan_page: "Səhifə {page}/{total}",
    new_interval_prompt: "⏱ Yeni interval (120-300 saniyə):",
    interval_updated: "✅ İnterval {sec} saniyəyə dəyişdirildi.",
    session_expired: "⚠️ Sessiya bitdi. Yenidən skan edin.",
    auto_reply_on: "🟢 Avtocavab aktiv",
    auto_reply_off: "🔴 Avtocavab dayandırılıb",
    auto_reply_toggle_on: "▶️ Başlat",
    auto_reply_toggle_off: "⏹ Dayandır",
    auto_reply_enabled: "✅ Avtocavab aktivləşdirildi.",
    auto_reply_disabled: "✅ Avtocavab dayandırıldı.",
    admin_phone_change_prompt: "Nömrə yenilənməsi üçün təsdiq göndərildi.",
    btn_all_bots: "🤖 Bütün Botlar",
    btn_renew_lic: "🔑 Lisenziyanı yenilə / Aktivləşdir",
    lic_expired_msg: "⛔ Lisenziya müddəti bitdi. Bot avtomatik dayandırıldı.\n\nYeniləmək üçün dəstəyə yazın və ya yeni kod aktivləşdirin.",
    pause_started: "⏳ {tours} tur tamamlandı. {min} dəqiqəlik fasilə başladı. Fasilədən sonra avtomatik davam edəcək.",
    err_group_restrict: "⚠️ Qrupda məhdudiyyət ({kind}): {group}\nHesab: +{phone}\n{detail}",
    err_account_flood: "⚠️ Flood/spam limiti: +{phone}\nTelegram müvəqqəti məhdudiyyət qoyub.\n{detail}",
    err_account_logout: "⚠️ Hesab çıxış etdi: +{phone}\nSessiya bitib. Yenidən nömrə əlavə edin.\n{detail}",
    err_account_other: "⚠️ Ciddi xəta (+{phone}): {detail}"
  },
  tr: {
    about: "🤖 *ELITE OTOMESAJ BOTU*\n\nHoş geldiniz! Lütfen aşağıdaki menüden işlem seçiniz.",
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
    ask_interval: "✅ İntervalı girin (120-300 saniye):",
    interval_err: "⚠️ 120 ile 300 arası sayı girin.",
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
    scan_done: "✅ {count} grup eklendi. Kontrol panelinden başlatın.",
    no_groups_found: "❌ Hiç grup bulunamadı.",
    scan_page: "Sayfa {page}/{total}",
    new_interval_prompt: "⏱ Yeni aralık (120-300 saniye):",
    interval_updated: "✅ Aralık {sec} saniyeye değiştirildi.",
    session_expired: "⚠️ Oturum süresi doldu. Yeniden tarayın.",
    auto_reply_on: "🟢 Otomatik yanıt aktif",
    auto_reply_off: "🔴 Otomatik yanıt durduruldu",
    auto_reply_toggle_on: "▶️ Başlat",
    auto_reply_toggle_off: "⏹ Durdur",
    auto_reply_enabled: "✅ Otomatik yanıt etkinleştirildi.",
    auto_reply_disabled: "✅ Otomatik yanıt durduruldu.",
    admin_phone_change_prompt: "Numara güncellemesi için onay gönderildi.",
    btn_all_bots: "🤖 Tüm Botlar",
    btn_renew_lic: "🔑 Lisansı Yenile / Etkinleştir",
    lic_expired_msg: "⛔ Lisans süresi doldu. Bot otomatik durduruldu.\n\nYenilemek için destek ile iletişime geçin veya yeni kod etkinleştirin.",
    pause_started: "⏳ {tours} tur tamamlandı. {min} dakikalık mola başladı. Moladan sonra otomatik devam edecek.",
    err_group_restrict: "⚠️ Grupta kısıtlama ({kind}): {group}\nHesap: +{phone}\n{detail}",
    err_account_flood: "⚠️ Flood/spam limiti: +{phone}\nTelegram geçici kısıtlama koydu.\n{detail}",
    err_account_logout: "⚠️ Hesap çıkış yaptı: +{phone}\nOturum sona erdi. Numarayı yeniden ekleyin.\n{detail}",
    err_account_other: "⚠️ Ciddi hata (+{phone}): {detail}"
  },
  en: {
    about: "🤖 *ELITE OTOMESAJ BOTU*\n\nWelcome! Please select an operation from the menu below.",
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
    ask_interval: "✅ Enter interval (120-300 seconds):",
    interval_err: "⚠️ Enter number between 120 and 300.",
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
    scan_done: "✅ {count} groups added. Start from panel.",
    no_groups_found: "❌ No groups found.",
    scan_page: "Page {page}/{total}",
    new_interval_prompt: "⏱ New interval (120-300 seconds):",
    interval_updated: "✅ Interval changed to {sec} seconds.",
    session_expired: "⚠️ Session expired. Scan again.",
    auto_reply_on: "🟢 Auto-reply active",
    auto_reply_off: "🔴 Auto-reply stopped",
    auto_reply_toggle_on: "▶️ Start",
    auto_reply_toggle_off: "⏹ Stop",
    auto_reply_enabled: "✅ Auto-reply enabled.",
    auto_reply_disabled: "✅ Auto-reply disabled.",
    admin_phone_change_prompt: "Number update confirmation sent.",
    btn_all_bots: "🤖 All Bots",
    btn_renew_lic: "🔑 Renew / Activate License",
    lic_expired_msg: "⛔ Your license has expired. The bot was stopped automatically.\n\nContact support to renew or activate a new code.",
    pause_started: "⏳ {tours} rounds completed. {min}-minute pause started. It will resume automatically after the pause.",
    err_group_restrict: "⚠️ Group restriction ({kind}): {group}\nAccount: +{phone}\n{detail}",
    err_account_flood: "⚠️ Flood/spam limit: +{phone}\nTelegram applied a temporary restriction.\n{detail}",
    err_account_logout: "⚠️ Account signed out: +{phone}\nSession expired. Please add the number again.\n{detail}",
    err_account_other: "⚠️ Serious error (+{phone}): {detail}"
  },
  ru: {
    about: "🤖 *ELITE OTOMESAJ BOTU*\n\nДобро пожаловать! Пожалуйста, выберите действие из меню ниже.",
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
    ask_interval: "✅ Введите интервал (120-300 секунд):",
    interval_err: "⚠️ Введите число от 120 до 300.",
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
    scan_done: "✅ {count} групп добавлено. Запустите из панели.",
    no_groups_found: "❌ Групп не найдено.",
    scan_page: "Страница {page}/{total}",
    new_interval_prompt: "⏱ Новый интервал (120-300 секунд):",
    interval_updated: "✅ Интервал изменен на {sec} секунд.",
    session_expired: "⚠️ Сессия истекла. Отсканируйте заново.",
    auto_reply_on: "🟢 Автоответ активен",
    auto_reply_off: "🔴 Автоответ остановлен",
    auto_reply_toggle_on: "▶️ Запустить",
    auto_reply_toggle_off: "⏹ Остановить",
    auto_reply_enabled: "✅ Автоответ включен.",
    auto_reply_disabled: "✅ Автоответ выключен.",
    admin_phone_change_prompt: "Подтверждение обновления номера отправлено.",
    btn_all_bots: "🤖 Все боты",
    btn_renew_lic: "🔑 Обновить / Активировать лицензию",
    lic_expired_msg: "⛔ Срок лицензии истёк. Бот остановлен автоматически.\n\nНапишите в поддержку или активируйте новый код.",
    pause_started: "⏳ Завершено {tours} кругов. Пауза {min} мин. После паузы работа продолжится автоматически.",
    err_group_restrict: "⚠️ Ограничение в группе ({kind}): {group}\nАккаунт: +{phone}\n{detail}",
    err_account_flood: "⚠️ Лимит flood/spam: +{phone}\nTelegram временно ограничил отправку.\n{detail}",
    err_account_logout: "⚠️ Аккаунт вышел: +{phone}\nСессия истекла. Добавьте номер заново.\n{detail}",
    err_account_other: "⚠️ Серьёзная ошибка (+{phone}): {detail}"
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
  const settings = await getDB('settings') || {};
  const defaults = {
    channel1: "https://t.me/EliteBotDestek",
    channel2: "https://t.me/EliteBotMedia",
    channel1_id: "@EliteBotDestek",
    channel2_id: "@EliteBotMedia",
    webUrl: "https://EliteBot.com",
    support: SUPPORT_URL,
    allBotsUrl: ALL_BOTS_URL,
    autoReplyCooldownDays: DEFAULT_AUTOREPLY_COOLDOWN_DAYS,
    toursBeforePause: DEFAULT_TOURS_BEFORE_PAUSE,
    pauseMinutes: DEFAULT_PAUSE_MINUTES
  };
  const merged = { ...defaults, ...settings };
  const needsWrite =
    !settings ||
    settings.autoReplyCooldownDays == null ||
    settings.toursBeforePause == null ||
    settings.pauseMinutes == null ||
    !settings.support ||
    !settings.allBotsUrl;
  if (needsWrite) await setDB('settings', merged);
})();

// ============ YARDIMÇI FUNKSİYALAR ============
const userStates = {}; 
const userSessions = {}; 
const mainMsgIds = {}; 

if (!global.abortFlags) global.abortFlags = {};
if (!global.runningAccounts) global.runningAccounts = new Set();
if (!global.errorNotifiedAt) global.errorNotifiedAt = {};
if (!global.expiredNotified) global.expiredNotified = {};
if (!global.pauseNotified) global.pauseNotified = {};

function accTaskKey(chatId, phone) {
  return `${chatId}_${phone}`;
}

function requestAbort(chatId, phone) {
  global.abortFlags[accTaskKey(chatId, phone)] = true;
}

function requestAbortAll(chatId, accounts) {
  if (!accounts) return;
  for (const phone of Object.keys(accounts)) requestAbort(chatId, phone);
}

function isAborted(chatId, phone) {
  return !!global.abortFlags[accTaskKey(chatId, phone)];
}

function clearAbort(chatId, phone) {
  delete global.abortFlags[accTaskKey(chatId, phone)];
}

async function interruptibleSleep(ms, abortFn) {
  const step = 400;
  let elapsed = 0;
  while (elapsed < ms) {
    if (abortFn && abortFn()) return false;
    const chunk = Math.min(step, ms - elapsed);
    await new Promise(r => setTimeout(r, chunk));
    elapsed += chunk;
  }
  return true;
}

function classifySendError(err) {
  const m = String(err?.errorMessage || err?.message || err || '').toUpperCase();
  if (/AUTH_KEY_UNREGISTERED|SESSION_REVOKED|USER_DEACTIVATED|SESSION_EXPIRED|AUTH_KEY_INVALID|PHONE_NUMBER_BANNED|USER_DEACTIVATED_BAN/.test(m)) {
    return 'logout';
  }
  if (/PEER_FLOOD|FLOOD_WAIT/.test(m)) return 'flood';
  if (/CHAT_WRITE_FORBIDDEN|CHAT_ADMIN_REQUIRED|USER_BANNED|BANNED_IN_CHANNEL|CHAT_RESTRICTED|USER_RESTRICTED|CHAT_SEND_|YOU_BLOCKED_USER|CHAT_FORBIDDEN/.test(m)) {
    return 'restrict';
  }
  return 'other';
}

function restrictKind(err) {
  const m = String(err?.errorMessage || err?.message || err || '').toUpperCase();
  if (/USER_BANNED|BANNED_IN_CHANNEL|CHAT_FORBIDDEN/.test(m)) return 'Ban';
  if (/CHAT_RESTRICTED|USER_RESTRICTED|CHAT_ADMIN_REQUIRED/.test(m)) return 'Restrict';
  if (/CHAT_WRITE_FORBIDDEN|CHAT_SEND_/.test(m)) return 'Mute / yazma qadağanı';
  return 'Restrict';
}

function shouldNotifyError(key, cooldownMs = 8 * 60 * 1000) {
  const last = global.errorNotifiedAt[key] || 0;
  if (Date.now() - last < cooldownMs) return false;
  global.errorNotifiedAt[key] = Date.now();
  return true;
}

async function notifyUser(chatId, text) {
  try {
    await bot.sendMessage(chatId, text);
  } catch (e) {}
}

function getLicenseExpiryMs(lic) {
  if (!lic) return null;
  const expiry = lic.expireTimestamp || lic.expiresAt || lic.expireDate;
  if (!expiry) return null;
  return typeof expiry === 'number' ? expiry : new Date(expiry).getTime();
}

function isLicenseCurrentlyValid(lic) {
  if (!lic || lic.active === false) return false;
  const time = getLicenseExpiryMs(lic);
  if (time && time < Date.now()) return false;
  return true;
}

async function saveUserProfile(chatId, fromUser) {
  if (!fromUser) return;
  const profile = {
    id: fromUser.id || chatId,
    username: fromUser.username || '',
    firstName: fromUser.first_name || '',
    lastName: fromUser.last_name || '',
    languageCode: fromUser.language_code || ''
  };
  await setDB(`users/${chatId}/profile`, profile);
  return profile;
}

async function syncLicenseUserInfo(chatId, licenseCode, fromUser) {
  if (!licenseCode) return;
  const user = await getDB(`users/${chatId}`) || {};
  const phones = user.accounts
    ? Object.keys(user.accounts).map(p => (String(p).startsWith('+') ? String(p) : `+${p}`))
    : [];
  const info = {
    id: chatId,
    username: fromUser?.username || user.profile?.username || '',
    firstName: fromUser?.first_name || user.profile?.firstName || '',
    lastName: fromUser?.last_name || user.profile?.lastName || '',
    phones,
    updatedAt: new Date().toISOString()
  };
  await setDB(`licenses/${licenseCode}/usedByInfo`, info);
}

async function stopAllAccountsForLicense(chatId, user) {
  requestAbortAll(chatId, user?.accounts);
  if (user?.accounts) {
    for (const phone of Object.keys(user.accounts)) {
      await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED');
    }
  }
  await setDB(`users/${chatId}/fullBotActive`, false);
  await setDB(`users/${chatId}/autoReplyEnabled`, false);
}

async function expireAndNotify(chatId, user) {
  await stopAllAccountsForLicense(chatId, user);
  if (global.expiredNotified[chatId]) return;
  global.expiredNotified[chatId] = true;
  const lang = user?.lang || 'az';
  try {
    await bot.sendMessage(chatId, t('lic_expired_msg', lang), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t('btn_renew_lic', lang), url: SUPPORT_URL }],
          [{ text: t('btn_act_lic', lang), callback_data: 'enter_license' }]
        ]
      }
    });
  } catch (e) {}
}

async function sendSourceAsOriginal(client, sourceEntity, msg, target) {
  try {
    await client.forwardMessages(target, {
      messages: msg.id,
      fromPeer: sourceEntity,
      dropAuthor: true
    });
    return;
  } catch (e1) {}
  const opts = {
    message: msg.message || '',
    formattingEntities: msg.entities || undefined
  };
  if (msg.media && msg.media.className !== 'MessageMediaEmpty') {
    opts.file = msg.media;
  }
  await client.sendMessage(target, opts);
}


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
  let licExpText = "";

  if (user?.activeLicense) {
    const lic = await getDB(`licenses/${user.activeLicense}`);
    if (lic) {
       let expiry = lic.expireTimestamp || lic.expiresAt || lic.expireDate;
       if (!expiry && lic.durationDays) {
           expiry = Date.now() + (parseInt(lic.durationDays) * 24 * 60 * 60 * 1000);
           await setDB(`licenses/${user.activeLicense}/expireTimestamp`, expiry);
       }
       let time = null;
       if (expiry) time = typeof expiry === 'number' ? expiry : new Date(expiry).getTime();
       if (!time || time > Date.now()) {
           licActive = lic.active;
           if (time) {
               const days = Math.ceil((time - Date.now()) / (1000 * 60 * 60 * 24));
               const expDateStr = new Date(time).toLocaleDateString('az-AZ');
               licExpText = ` (Bitmə tarixi: ${expDateStr} | Qalan: ${days} gün)`;
           }
       } else {
           licActive = false;
           await setDB(`licenses/${user.activeLicense}/active`, false);
       }
    }
  }

  const keyboard = [];
  if (!licActive) {
    const hadLicense = !!user?.activeLicense;
    if (hadLicense) {
      keyboard.push([
        { text: t('btn_renew_lic', lang), url: SUPPORT_URL }
      ]);
    }
    keyboard.push([
      { text: t('btn_act_lic', lang), callback_data: 'enter_license' },
      { text: t('btn_buy_lic', lang), url: SUPPORT_URL }
    ]);
    keyboard.push([
      { text: t('btn_price', lang), url: 'https://t.me/EliteBotMedia' },
      { text: t('btn_web', lang), url: 'https://EliteBot.com' }
    ]);
    keyboard.push([
      { text: '💬 WhatsApp Dəstək', url: 'https://wa.me/19048477074' }
    ]);
    keyboard.push([
      { text: '📩 Dəstək (Telegram)', url: SUPPORT_URL }
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
      { text: t('btn_buy_lic', lang), url: SUPPORT_URL },
      { text: t('btn_web', lang), url: 'https://EliteBot.com' }
    ]);
    keyboard.push([
      { text: user?.fullBotActive ? '⏹ Tam Botu Dayandır' : '🚀 Tam Botu Başlat', callback_data: 'start_full_bot' }
    ]);
    keyboard.push([
      { text: '💬 WhatsApp Dəstək', url: 'https://wa.me/19048477074' }
    ]);
    keyboard.push([
      { text: '📩 Dəstək (Telegram)', url: SUPPORT_URL }
    ]);
  }

  keyboard.push([
    { text: t('btn_all_bots', lang), url: ALL_BOTS_URL }
  ]);

  const baseAboutText = t('about', lang);
  const finalAbout = licActive ? `✅ Lisenziya Aktivdir!${licExpText}\n\n${baseAboutText}` : baseAboutText;

  await sendOrUpdate(chatId, finalAbout, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: keyboard } });
}

async function isSubscribed(userId) {
  const settings = await getDB('settings');
  const channels = [settings?.channel2_id, settings?.channel3_id].filter(Boolean);
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

function escapeMarkdown(text) {
  if (text === undefined || text === null) return '';
  return String(text).replace(/([_*`\[\]])/g, '\\$1');
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
  await saveUserProfile(chatId, msg.from);

  const keyboard = {
    inline_keyboard: [
      [{ text: '🇦🇿 Azərbaycan', callback_data: 'lang_az' }, { text: '🇹🇷 Türkçe', callback_data: 'lang_tr' }],
      [{ text: '🇬🇧 English', callback_data: 'lang_en' }, { text: '🇷🇺 Русский', callback_data: 'lang_ru' }]
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
  if (query.from) await saveUserProfile(chatId, query.from).catch(() => {});

  if (data.startsWith('lang_') || data === 'check_sub') {
    let newLang = lang;
    if (data.startsWith('lang_')) {
       newLang = data.split('_')[1];
       await setDB(`users/${chatId}/lang`, newLang);
    }

    if (data === 'check_sub') {
      const wait = await bot.sendMessage(chatId, t('checking', newLang));
      const ok = await isSubscribed(query.from.id);
      await bot.deleteMessage(chatId, wait.message_id).catch(() => {});
      if (ok) {
        await showMainMenu(chatId);
        return;
      }
    }
    
    const settings = await getDB('settings') || {};
    // MƏCBURİ KANALLAR BURA ƏLAVƏ EDİLDİ — İNDİ HƏR İKİSİ SEÇİLMİŞ DİLDƏ GÖRÜNÜR
    const keyboard = {
      inline_keyboard: [
        [{ text: t('ch1_btn', newLang), url: settings.channel2 || 'https://t.me/EliteBotMedia' }],
        [{ text: t('ch2_btn', newLang), url: 'https://t.me/+1MsfqoAHmaQ1ZTli' }],
        [{ text: t('sub_btn', newLang), callback_data: 'check_sub' }]
      ]
    };
    
    const txt = data === 'check_sub' ? t('not_subscribed', newLang) : t('sub_msg', newLang);
    await sendOrUpdate(chatId, txt, { reply_markup: keyboard });
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
    const expiry = lic?.expireTimestamp || lic?.expiresAt;
    const isExpired = expiry && (typeof expiry === 'number' ? expiry : new Date(expiry).getTime()) < Date.now();
    
    if (!lic?.active || isExpired) {
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
      // İNTERVAL ARTıq SANİYƏ İLƏ GÖSTƏRİLİR
      const intSec = acc.intervalSeconds || (acc.intervalMinutes ? acc.intervalMinutes * 60 : 120);
      msg += `📱 +${phone}\n⏳ İnterval: ${intSec} saniyə\n📥 Mənbə: ${src}\n📊 ${status}\n\n`;
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
      let expiry = lic?.expireTimestamp || lic?.expiresAt || lic?.expireDate;
      if (!expiry && lic?.durationDays) {
          expiry = Date.now() + (parseInt(lic.durationDays) * 24 * 60 * 60 * 1000);
          await setDB(`licenses/${userData.activeLicense}/expireTimestamp`, expiry);
      }
      if (expiry) {
         const time = typeof expiry === 'number' ? expiry : new Date(expiry).getTime();
         const diff = time - Date.now();
         const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
         if (days > 0) {
             const expDate = new Date(time).toLocaleDateString('az-AZ');
             expText = `${expDate} (Qalan gün: ${days})`;
         } else {
             expText = "Müddəti bitib";
         }
      }
      msg += `🔑 *Lisenziya:* ${userData.activeLicense}\n⏳ *Bitiş tarixi:* ${expText}\n`;
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

  if (data === 'start_full_bot') {
    const userData = await getDB(`users/${chatId}`) || {};
    const isCurrentlyActive = userData.fullBotActive || false;
    const newState = !isCurrentlyActive;

    if (!newState) {
      requestAbortAll(chatId, userData.accounts);
    }

    await setDB(`users/${chatId}/fullBotActive`, newState);
    await setDB(`users/${chatId}/autoReplyEnabled`, newState);

    if (userData.accounts) {
      for (const phone in userData.accounts) {
        if (newState) {
          clearAbort(chatId, phone);
          await setDB(`users/${chatId}/accounts/${phone}/status`, 'ACTIVE');
          await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, 0);
        } else {
          requestAbort(chatId, phone);
          await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED');
        }
      }
    }

    const msgText = newState
      ? '🚀 Tam bot başladıldı! Həm avtomatik cavab, həm də qruplara mesaj atma funksiyası aktivləşdirildi.'
      : '⏹ Tam bot dayandırıldı! Həm avtomatik cavab, həm də qruplara mesaj atma funksiyası dayandırıldı.';
    bot.sendMessage(chatId, msgText).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 5000));
    await showMainMenu(chatId);
    return;
  }

  if (data.startsWith('toggle_')) {
    const phone = data.replace('toggle_', '');
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (acc) {
      const newStatus = acc.status === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
      if (newStatus === 'STOPPED') {
        requestAbort(chatId, phone);
        await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED');
      } else {
        clearAbort(chatId, phone);
        await setDB(`users/${chatId}/accounts/${phone}/status`, 'ACTIVE');
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
    
    const existing = await getDB(`users/${chatId}/accounts/${phone}/targetGroups`) || [];
    const merged = [...new Set([...existing, ...selected])];
    
    await setDB(`users/${chatId}/accounts/${phone}/targetGroups`, merged);
    await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED');
    
    const acc = await getDB(`users/${chatId}/accounts/${phone}`);
    if (!acc.intervalSeconds && !acc.intervalMinutes) {
      await setDB(`users/${chatId}/accounts/${phone}/intervalSeconds`, 120);
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
      const dialogs = await client.getDialogs({ limit: 500 });
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
      
      const existingGroups = acc.targetGroups || [];
      const scanSelected = new Set();
      
      groups.forEach((g, index) => {
        const gStr = g.username ? `@${g.username}` : `chat:${g.id} - ${g.title}`;
        if (existingGroups.includes(gStr)) {
            scanSelected.add(index);
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
      // LIMIT 30 -> 90 (Telegram inline button limiti ~100, təhlükəsiz 90)
      const displayGroups = groups.slice(0, 90);
      if (groups.length > 90) {
          msg += `⚠️ Çox sayda qrup var. Yalnız ilk 90 qrup göstərilir.\n\n`;
      }
      displayGroups.forEach((g, i) => {
        let display = g;
        if (g.startsWith('chat:')) {
          const parts = g.split(' - ');
          display = parts.length > 1 ? parts.slice(1).join(' - ') : parts[0];
        }
        msg += `${i+1}. ${escapeMarkdown(display)}\n`;
        const safeGroupName = Array.from(display || '').slice(0, 20).join('');
        kb.push([{ text: t('del_group_btn', lang, { group: safeGroupName }), callback_data: `delgroup_${phone}_${i}` }]);
      });
    }
    
    kb.push([{ text: t('add_group_btn', lang), callback_data: `addgroup_${phone}` }]);
    kb.push([{ text: t('back_btn', lang), callback_data: 'manage_numbers' }]);
    kb.push([{ text: t('back_main', lang), callback_data: 'back_to_main' }]);
    
    try {
        await sendOrUpdate(chatId, msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: kb } });
    } catch (error) {
        try {
            delete mainMsgIds[chatId];
            await sendOrUpdate(chatId, msg.replace(/[_*`\[\]]/g, ''), { reply_markup: { inline_keyboard: kb } });
        } catch (error2) {
            console.error('Qrup siyahisi gosterme xetasi:', error2.message);
        }
    }
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
  // PER PAGE 5 -> 15 (100 qrupa qədər rahat seçim üçün)
  const perPage = 15;
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
      const expiry = lic.expireTimestamp || lic.expiresAt;
      const isExpired = expiry && (typeof expiry === 'number' ? expiry : new Date(expiry).getTime()) < Date.now();
      
      if (!lic.active || isExpired) {
        await sendOrUpdate(chatId, t('blocked_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      if (lic.usedBy && lic.usedBy !== chatId) {
        await sendOrUpdate(chatId, t('used_lic', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      if (!lic.usedBy) await setDB(`licenses/${text}/usedBy`, chatId);
      const hasExpiry = lic.expireTimestamp || lic.expiresAt || lic.expireDate;
      if (!hasExpiry && lic.durationDays) {
        const newExpireTimestamp = Date.now() + (parseInt(lic.durationDays) * 24 * 60 * 60 * 1000);
        await setDB(`licenses/${text}/expireTimestamp`, newExpireTimestamp);
      }
      await setDB(`users/${chatId}/activeLicense`, text);
      await saveUserProfile(chatId, msg.from);
      await syncLicenseUserInfo(chatId, text, msg.from);
      delete global.expiredNotified[chatId];
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
        // İNTERVAL ARTıq SANİYƏ İLƏ (120 saniyə default)
        await setDB(`users/${chatId}/accounts/${phoneKey}/intervalSeconds`, 120);
        await setDB(`users/${chatId}/accounts/${phoneKey}/messageSource`, { type: 'saved' });
        
        const userData = await getDB(`users/${chatId}`);
        if (userData?.activeLicense) {
          await setDB(`licenses/${userData.activeLicense}/registeredPhones/${phoneKey}`, true);
          await syncLicenseUserInfo(chatId, userData.activeLicense, msg.from);
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
      // İNTERVAL ARTıq SANİYƏ (120-300)
      const sec = parseInt(text);
      if (isNaN(sec) || sec < 120 || sec > 300) {
        await sendOrUpdate(chatId, t('interval_err', lang), { reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
        return;
      }
      if (state === 'AWAITING_CHANGE_INTERVAL') {
        const phone = await getDB(`users/${chatId}/changingIntervalPhone`);
        if (phone) {
          await setDB(`users/${chatId}/accounts/${phone}/intervalSeconds`, sec);
          await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, 0);
          await setDB(`users/${chatId}/state`, 'IDLE');
          await setDB(`users/${chatId}/changingIntervalPhone`, null);
          bot.sendMessage(chatId, t('interval_updated', lang, { sec })).then(m => setTimeout(() => bot.deleteMessage(chatId, m.message_id).catch(() => {}), 3000));
          await showMainMenu(chatId);
        }
        return;
      }
      const phone = await getDB(`users/${chatId}/currentPhoneSetup`);
      if (phone) {
        await setDB(`users/${chatId}/accounts/${phone}/intervalSeconds`, sec);
        await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, 0); 
        await setDB(`users/${chatId}/state`, 'IDLE');
        delete userSessions[chatId];
        await sendOrUpdate(chatId, `✅ İnterval təyin edildi: ${sec} saniyə.\n\nİndi idarə panelindən hesabınıza daxil olaraq "▶️ Başlat" vuraraq işə sala bilərsiniz.`, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: t('back_main', lang), callback_data: 'back_to_main' }]] } });
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
    const settings = await getDB('settings') || {};
    const toursBeforePause = parseInt(settings.toursBeforePause) || DEFAULT_TOURS_BEFORE_PAUSE;
    const pauseMinutes = parseInt(settings.pauseMinutes) || DEFAULT_PAUSE_MINUTES;

    const tasks = [];

    for (const chatId in users) {
      const user = users[chatId];
      if (!user.accounts) continue;

      let lic = null;
      if (user.activeLicense) {
        lic = await getDB(`licenses/${user.activeLicense}`);
      }
      const licenseOk = isLicenseCurrentlyValid(lic);
      if (user.activeLicense && !licenseOk) {
        await expireAndNotify(chatId, user);
        continue;
      }

      for (const phone in user.accounts) {
        const acc = user.accounts[phone];
        if (!acc.telegramSession) continue;

        const taskKey = accTaskKey(chatId, phone);
        if (global.runningAccounts.has(taskKey)) continue;

        const groups = acc.targetGroups || [];
        // İNTERVAL ARTıq SANİYƏ İLƏ (120-300 saniyə arası)
        let intervalSec = acc.intervalSeconds;
        if (!intervalSec && acc.intervalMinutes) {
          intervalSec = acc.intervalMinutes * 60;
        }
        if (!intervalSec) intervalSec = 120;
        intervalSec = Math.max(120, Math.min(300, intervalSec));
        const interval = intervalSec * 1000;
        
        const paused = acc.pauseUntil && Date.now() < acc.pauseUntil;
        if (paused && !(user.autoReplyEnabled && user.autoReplyMessage)) continue;

        const timeToSendMessage =
          licenseOk &&
          acc.status === 'ACTIVE' &&
          !paused &&
          (Date.now() - (acc.lastSentAt || 0) >= interval) &&
          groups.length > 0;
        const shouldAutoReply = licenseOk && user.autoReplyEnabled && user.autoReplyMessage;

        if (timeToSendMessage || shouldAutoReply) {
          global.runningAccounts.add(taskKey);
          tasks.push(
            processAccountTask(chatId, phone, user, acc, timeToSendMessage, groups, {
              toursBeforePause,
              pauseMinutes
            })
              .catch(e => console.error('Task xətası:', e.message))
              .finally(() => global.runningAccounts.delete(taskKey))
          );
        }
      }
    }

    await Promise.allSettled(tasks);

  } catch (e) {
    console.error('Interval xətası:', e);
  }
}, 30000);

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} vaxtı bitdi (timeout)`)), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timer));
}

async function processAccountTask(chatId, phone, user, acc, timeToSendMessage, groups, tourCfg = {}) {
  let client;
  const lang = user?.lang || 'az';
  const toursBeforePause = tourCfg.toursBeforePause || DEFAULT_TOURS_BEFORE_PAUSE;
  const pauseMinutes = tourCfg.pauseMinutes || DEFAULT_PAUSE_MINUTES;

  try {
    client = new TelegramClient(new StringSession(acc.telegramSession), API_ID, API_HASH, { connectionRetries: 1 });
    await client.connect();
    await client.getDialogs({ limit: 300 }).catch(() => {});

    if (timeToSendMessage && !isAborted(chatId, phone)) {
      const source = acc.messageSource || { type: 'saved' };

      let sourceEntity = 'me';
      if (source.type === 'custom' && source.target) {
        const entityTarget = await resolveEntity(client, source.target);
        sourceEntity = await client.getEntity(entityTarget).catch(() => entityTarget);
      }

      let sourceMsg = null;
      try {
        const msgs = await client.getMessages(sourceEntity, { limit: 1 });
        if (msgs && msgs.length > 0) sourceMsg = msgs[0];
      } catch (e) {
        console.log('Mənbə mesajı oxunmadı:', e.message);
      }

      let abortedMidRound = false;

      if (sourceMsg && (sourceMsg.message || sourceMsg.media)) {
        // HƏMİŞƏ 1-Cİ QRUPdan BAŞLAYIR
        for (let i = 0; i < groups.length; i++) {
          if (isAborted(chatId, phone)) {
            abortedMidRound = true;
            break;
          }

          // QRUP ARASI 0-60 SANİYƏ RANDOM FASİLƏ (spam qorunması)
          if (i > 0) {
            const delay = Math.random() * 60000; // 0-60 saniyə
            const continued = await interruptibleSleep(delay, () => isAborted(chatId, phone));
            if (!continued) {
              abortedMidRound = true;
              break;
            }
          }

          if (isAborted(chatId, phone)) {
            abortedMidRound = true;
            break;
          }

          const g = groups[i];
          try {
            const targetStr = await resolveEntity(client, g);
            const peer = (typeof targetStr === 'string' && /^-?\d+$/.test(targetStr)) ? BigInt(targetStr) : targetStr;
            const target = await client.getEntity(peer).catch(() => peer);

            if (!target) continue;

            // MESAJI OLDUĞU KİMİ ÖTÜRÜR (dəyişiklik yoxdur)
            await sendSourceAsOriginal(client, sourceEntity, sourceMsg, target);

            const groupName = target.title || target.username || g;
            try {
              const notifMsg = await bot.sendMessage(chatId, `✅ Mesaj atıldı: ${groupName}`);
              // BİLDİRİŞ 10-12 SANİYƏ SONRA SİLİNİR
              const delDelay = 10000 + Math.floor(Math.random() * 2001); // 10000-12000 ms
              setTimeout(() => {
                bot.deleteMessage(chatId, notifMsg.message_id).catch(() => {});
              }, delDelay);
            } catch (err) {}
          } catch (e) {
            const kind = classifySendError(e);
            const detail = e.message || String(e);
            console.log(`Qrupa göndərilərkən xəta:`, detail);

            if (kind === 'logout') {
              requestAbort(chatId, phone);
              await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED');
              if (shouldNotifyError(`logout_${chatId}_${phone}`, 30 * 60 * 1000)) {
                await notifyUser(chatId, t('err_account_logout', lang, { phone, detail }));
              }
              abortedMidRound = true;
              break;
            }

            if (kind === 'flood') {
              await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, Date.now() + 10 * 60 * 1000);
              if (shouldNotifyError(`flood_${chatId}_${phone}`, 15 * 60 * 1000)) {
                await notifyUser(chatId, t('err_account_flood', lang, { phone, detail }));
              }
              abortedMidRound = true;
              break;
            }

            if (kind === 'restrict') {
              const groupName = String(g);
              if (shouldNotifyError(`restrict_${chatId}_${phone}_${groupName}`, 20 * 60 * 1000)) {
                await notifyUser(chatId, t('err_group_restrict', lang, {
                  kind: restrictKind(e),
                  group: groupName,
                  phone,
                  detail
                }));
              }
            } else if (shouldNotifyError(`other_${chatId}_${phone}`, 20 * 60 * 1000)) {
              await notifyUser(chatId, t('err_account_other', lang, { phone, detail }));
            }
          }
        }
      }

      // 5 TUR SONRA 30 DƏQİQƏ FASİLƏ, SONRA 1-Cİ QRUPdan YENİDƏN BAŞLAYIR
      if (!abortedMidRound && !isAborted(chatId, phone)) {
        await setDB(`users/${chatId}/accounts/${phone}/lastSentAt`, Date.now());
        const prevTours = parseInt(acc.toursCompleted) || 0;
        const nextTours = prevTours + 1;
        if (nextTours >= toursBeforePause) {
          const pauseUntil = Date.now() + pauseMinutes * 60 * 1000;
          await setDB(`users/${chatId}/accounts/${phone}/toursCompleted`, 0);
          await setDB(`users/${chatId}/accounts/${phone}/pauseUntil`, pauseUntil);
          const pKey = `${chatId}_${phone}_${pauseUntil}`;
          if (!global.pauseNotified[pKey]) {
            global.pauseNotified[pKey] = true;
            await notifyUser(chatId, t('pause_started', lang, { tours: toursBeforePause, min: pauseMinutes }));
          }
        } else {
          await setDB(`users/${chatId}/accounts/${phone}/toursCompleted`, nextTours);
        }
      }
    }

    // AVTOCAVAB BÖLMƏSİ - Biz Telegram-da olmasaq belə avtomatik işləyir
    if (user.autoReplyEnabled && user.autoReplyMessage && !isAborted(chatId, phone)) {
      if (!global.repliedMsgs) global.repliedMsgs = {};

      const settings = await getDB('settings') || {};
      const cooldownDays = parseInt(settings.autoReplyCooldownDays) || DEFAULT_AUTOREPLY_COOLDOWN_DAYS;
      const cooldownMs = Math.max(1, cooldownDays) * 24 * 60 * 60 * 1000;
      const cooldowns = user.autoReplyCooldowns || {};

      try {
        const pms = await client.getDialogs({ limit: 300 });
        for (const pm of pms) {
          if (isAborted(chatId, phone)) break;
          if (pm.isUser && pm.entity && !pm.entity.bot && !pm.entity.isSelf && !pm.entity.self) {
            const history = await client.getMessages(pm.entity, { limit: 1 });
            if (history && history.length > 0 && !history[0].out) {
              const lastMsgId = history[0].id;
              const memKey = `${phone}_${pm.id}`;
              const lastAt = cooldowns[memKey] || 0;
              const onCooldown = lastAt && (Date.now() - lastAt) < cooldownMs;

              if (global.repliedMsgs[memKey] !== lastMsgId && !onCooldown) {
                try {
                  // ⬇️ ƏSAS DÜZƏLİŞ: pm.id yerinə pm.entity istifadə edirik (access_hash üçün)
                  let inputPeer;
                  try {
                    inputPeer = pm.inputEntity || await client.getInputEntity(pm.entity);
                  } catch (e1) {
                    try {
                      inputPeer = await client.getInputEntity(pm.id);
                    } catch (e2) {
                      continue;
                    }
                  }
                  if (!inputPeer) continue;

                  await client.invoke(new Api.messages.SetTyping({
                    peer: inputPeer,
                    action: new Api.SendMessageTypingAction()
                  }));
                  const typingOk = await interruptibleSleep(2000 + Math.random() * 2000, () => isAborted(chatId, phone));
                  if (!typingOk) break;

                  await client.sendMessage(inputPeer, { message: user.autoReplyMessage });
                  await client.invoke(new Api.messages.ReadHistory({
                    peer: inputPeer,
                    maxId: 0
                  }));

                  global.repliedMsgs[memKey] = lastMsgId;
                  const nowTs = Date.now();
                  cooldowns[memKey] = nowTs;
                  await setDB(`users/${chatId}/autoReplyCooldowns/${memKey}`, nowTs);
                } catch (err) {}
              }
            }
          }
        }
      } catch (e) {}
    }

  } catch (e) {
    const kind = classifySendError(e);
    const detail = e.message || String(e);
    console.error('Proses task xətası:', detail);
    if (kind === 'logout') {
      requestAbort(chatId, phone);
      await setDB(`users/${chatId}/accounts/${phone}/status`, 'STOPPED');
      if (shouldNotifyError(`logout_${chatId}_${phone}`, 30 * 60 * 1000)) {
        await notifyUser(chatId, t('err_account_logout', lang, { phone, detail }));
      }
    } else if (kind === 'flood') {
      if (shouldNotifyError(`flood_${chatId}_${phone}`, 15 * 60 * 1000)) {
        await notifyUser(chatId, t('err_account_flood', lang, { phone, detail }));
      }
    }
  } finally {
    if (client) {
      try { await withTimeout(client.disconnect(), 10000, 'Disconnect'); } catch (e) {}
    }
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