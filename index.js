const TelegramBot = require('node-telegram-bot-api');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fetch = require('node-fetch');
const http = require('http');

// ------------------------------------------------------------------
// Health‑check server (Render üçün tələb olunan port)
// ------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => { res.writeHead(200); res.end("Bot işləyir."); }).listen(PORT, () => {
  console.log(`Health-check serveri ${PORT} portunda işə düşdü.`);
});

// ------------------------------------------------------------------
// Sabitlər
// ------------------------------------------------------------------
const BOT_TOKEN = "8940602664:AAHbe3HRkoselmfmUgmzvwWuJFfPkrCnKUg";
const API_ID = 36726228;
const API_HASH = "59b3c57e519c9cf2463b8725bc7c4f36";
const FIREBASE_URL = "https://newbot-db894-default-rtdb.europe-west1.firebasedatabase.app";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const userSessions = {};                     // Keçici yaddaş (OTP üçün)
const mainMessageIds = new Map();            // Hər istifadəçi üçün əsas interfeys mesajının ID‑si

console.log("EliteBot Serveri Başladı...");

// ------------------------------------------------------------------
// Çoxdilli dəstək
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
        phone_format: "⚠️ Nömrə '+' ilə başlamalıdır!", otp_sent: "⏳ OTP kodu göndərilir, gözləyin...",
        otp_info: "📩 Təhlükəsizlik kodu göndərildi. Kodu aralarında boşluqla daxil edin (Məs: 8 8 9 9 0):\n\nNömrəni səhv daxil etmisinizsə, /changenumber yazın.",
        err: "❌ Xəta: ", sess_lost: "⚠️ Sessiya yaddaşdan silinib. Zəhmət olmasa prosesə yenidən başlayın.",
        login_success: "✅ {phone} hesabına uğurla giriş edildi!\n\nİndi mesajın göndəriləcəyi qrupun *istifadəçi adını* (məs: @qrupadim) və ya *linkini* göndərin:",
        otp_err: "❌ OTP səhvdir və ya hesabda 2-Mərhələli təsdiqləmə (2FA) aktivdir. Xəta: ",
        group_added: "✅ Qrup əlavə olundu. (Hazırda bu nömrə üçün {count} qrup var)\n\nBaşqa qrup əlavə etmək istəyirsiniz, yoxsa davam edək?",
        add_more: "➕ Başqa qrup əlavə et", finish_btn: "✅ Bitir və Davam Et", send_group: "Əlavə etmək istədiyiniz qrupun *istifadəçi adını* və ya *linkini* göndərin:",
        ask_interval: "✅ Qruplar təsdiqləndi. İndi mesajın neçə dəqiqədən bir atılacağını rəqəmlə yazın (Məs: 2, 3, 5):",
        interval_err: "⚠️ Zəhmət olmasa 2 ilə 60 arası bir rəqəm yazın.",
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
        // Yeni idarəetmə
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
        admin_phone_change_prompt: "🔔 Admin tərəfindən nömrəniz dəyişdirildi. Yeni nömrəyə göndərilən OTP kodu daxil edin:",
    },
    tr: {
        sub_msg: "Aşağıdaki kanallara abone olun:", sub_btn: "✅ Abonelikleri Onayla", checking: "⏳ Abonelik kontrol ediliyor...",
        confirmed: "✅ Onaylandı!", not_subscribed: "❌ Henüz tüm kanallara abone olmadınız! Lütfen önce kanallara katılın ve tekrar deneyin.",
        menu_unlic: "Lütfen lisansınızı aktifleştirin:", btn_act_lic: "🔑 Lisansı Aktifleştir",
        btn_buy_lic: "🛒 Lisans Al / Destek", btn_price: "📋 Fiyat Listesi", btn_web: "🌐 Web Sitemiz",
        menu_lic: "✅ Lisans Aktif! Ana Menü:", btn_add_num: "➕ Yeni Numara Ekle", btn_manage: "⚙️ Hesaplarım (Numaralar)",
        enter_lic: "Lisans kodunu girin (Örn: ELITE-12345):", invalid_lic: "❌ Geçersiz lisans kodu formatı.",
        not_found_lic: "❌ Böyle bir lisans veritabanında mevcut değil!", blocked_lic: "❌ Bu lisans engellendi!",
        used_lic: "❌ Bu lisans zaten başka bir kullanıcı tarafından kullanılıyor!", success_lic: "✅ Lisans başarıyla onaylandı!",
        no_lic: "❌ Aktif lisansınız yok.", limit_reached: "❌ Lisans limitinize ulaştınız (Maksimum: {max} numara).",
        enter_phone: "📱 Bota bağlamak istediğiniz Telegram numaranızı girin (+ işareti ile. Örn: +994501234567):",
        no_numbers: "⚠️ Henüz hiç numara eklenmedi.", my_accounts: "⚙️ *Aktif Hesaplarınız:*\n\n",
        stopped: "🔴 Durduruldu", active: "🟢 Aktif", stop_btn: "Durdur: +", resume_btn: "Başlat: +", back_main: "🔙 Ana Menü",
        phone_format: "⚠️ Numara '+' ile başlamalıdır!", otp_sent: "⏳ OTP kodu gönderiliyor, bekleyin...",
        otp_info: "📩 Güvenlik kodu gönderildi. Kodu aralarında boşluk bırakarak girin (Örn: 8 8 9 9 0):\n\nNumarayı yanlış girdiyseniz, /changenumber yazın.",
        err: "❌ Hata: ", sess_lost: "⚠️ Oturum bellekten silindi. Lütfen işleme yeniden başlayın.",
        login_success: "✅ {phone} hesabına başarıyla giriş yapıldı!\n\nŞimdi mesajın gönderileceği grubun *kullanıcı adını* (örn: @grupadi) veya *linkini* gönderin:",
        otp_err: "❌ OTP yanlış veya hesapta 2 Adımlı Doğrulama (2FA) aktif. Hata: ",
        group_added: "✅ Grup eklendi. (Şu anda bu numara için {count} grup var)\n\nBaşka grup eklemek ister misiniz, yoksa devam edelim mi?",
        add_more: "➕ Başka grup ekle", finish_btn: "✅ Bitir ve Devam Et", send_group: "Eklemek istediğiniz grubun *kullanıcı adını* veya *linkini* gönderin:",
        ask_interval: "✅ Gruplar onaylandı. Şimdi mesajın kaç dakikada bir atılacağını rakamla yazın (Örn: 2, 3, 5):",
        interval_err: "⚠️ Lütfen 2 ile 60 arası bir rakam yazın.",
        bot_started: "✅ *Bot Çalışmaya Başladı ({phone})!*\n\nBot her {min} dakikada bir seçilen kaynaktan mesajları hedef gruplara atacak.",
        ch1_btn: "📢 Zorunlu Kanal 1", ch2_btn: "📢 Zorunlu Kanal 2", all_stopped: "⏹ Tüm hesaplar durduruldu.", stop_single: "⏹ +{phone} için gönderim durduruldu.",
        resume_single: "▶️ +{phone} yeniden çalışmaya başladı.", enter_again: "🔄 Telefon numaranızı yeniden girin (+ işareti ile):",
        source_prompt: "📥 Mesajlar nereden alınsın?",
        source_saved_btn: "💾 Kaydedilmiş mesajlar",
        source_custom_btn: "🔗 Özel Kanal/Grup/Bot",
        enter_source: "📢 Mesajın alınacağı kanal/grup/bot kullanıcı adını (@) veya linkini gönderin:",
        invalid_source: "❌ Girdiğiniz kaynağa erişilemedi. Lütfen doğru bir kullanıcı adı/link gönderin.",
        source_set_saved: "✅ Kaynak: Kaydedilmiş mesajlar.",
        source_set_custom: "✅ Kaynak belirlendi: {target}",
        cancel_btn: "❌ İptal",
        groups_btn: "📋 Grupları Yönet",
        source_btn: "📥 Kaynağı Yönet",
        delete_btn: "🗑 Numarayı Sil",
        back_btn: "🔙 Geri",
        del_group_btn: "❌ Sil: {group}",
        del_source_btn: "❌ Kaynağı sil (Kaydedilmiş mesajlara dön)",
        no_groups: "❌ Hiç grup eklenmedi.",
        confirm_delete_num: "❗️ +{phone} numarasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!",
        confirm_delete_num_yes: "✅ Evet, sil",
        confirm_delete_num_no: "❌ Hayır",
        num_deleted: "✅ +{phone} numarası sistemden silindi.",
        group_deleted: "✅ Grup silindi.",
        source_deleted: "✅ Kaynak silindi, artık kaydedilmiş mesajlardan kullanılacak.",
        add_group_btn: "➕ Yeni Grup Ekle",
        change_source_btn: "🔄 Kaynağı Değiştir",
        admin_phone_change_prompt: "🔔 Yönetici tarafından numaranız değiştirildi. Yeni numaraya gönderilen OTP kodunu girin:",
    },
    en: {
        sub_msg: "Please subscribe to the channels below:", sub_btn: "✅ Confirm Subscriptions", checking: "⏳ Checking subscription...",
        confirmed: "✅ Confirmed!", not_subscribed: "❌ You haven't subscribed to all the channels yet! Please join the channels first and check again.",
        menu_unlic: "Please activate your license:", btn_act_lic: "🔑 Activate License",
        btn_buy_lic: "🛒 Buy License / Support", btn_price: "📋 Price List", btn_web: "🌐 Our Website",
        menu_lic: "✅ License Active! Main Menu:", btn_add_num: "➕ Add New Number", btn_manage: "⚙️ My Accounts (Numbers)",
        enter_lic: "Enter your license code (e.g: ELITE-12345):", invalid_lic: "❌ Invalid license code format.",
        not_found_lic: "❌ No such license exists in the database!", blocked_lic: "❌ This license has been blocked!",
        used_lic: "❌ This license is already being used by another user!", success_lic: "✅ License successfully confirmed!",
        no_lic: "❌ You don't have an active license.", limit_reached: "❌ You have reached your license limit (Maximum: {max} numbers).",
        enter_phone: "📱 Enter the Telegram number you want to connect to the bot (with '+', e.g: +994501234567):",
        no_numbers: "⚠️ No numbers have been added yet.", my_accounts: "⚙️ *Your Active Accounts:*\n\n",
        stopped: "🔴 Stopped", active: "🟢 Active", stop_btn: "Stop: +", resume_btn: "Start: +", back_main: "🔙 Main Menu",
        phone_format: "⚠️ The number must start with '+'!", otp_sent: "⏳ Sending OTP code, please wait...",
        otp_info: "📩 Security code sent. Enter the code with spaces between digits (e.g: 8 8 9 9 0):\n\nIf you entered the wrong number, type /changenumber.",
        err: "❌ Error: ", sess_lost: "⚠️ Session was cleared from memory. Please start the process again.",
        login_success: "✅ Successfully logged into {phone}!\n\nNow send the *username* (e.g: @groupname) or *link* of the group you want to send messages to:",
        otp_err: "❌ OTP is incorrect or 2-Step Verification (2FA) is active on the account. Error: ",
        group_added: "✅ Group added. (Currently {count} group(s) for this number)\n\nWould you like to add another group, or continue?",
        add_more: "➕ Add another group", finish_btn: "✅ Finish and Continue", send_group: "Send the *username* or *link* of the group you want to add:",
        ask_interval: "✅ Groups confirmed. Now enter the number of minutes between each message (e.g: 2, 3, 5):",
        interval_err: "⚠️ Please enter a number between 2 and 60.",
        bot_started: "✅ *Bot Started ({phone})!*\n\nThe bot will send your messages from the selected source to the target groups every {min} minutes.",
        ch1_btn: "📢 Required Channel 1", ch2_btn: "📢 Required Channel 2", all_stopped: "⏹ All accounts stopped.", stop_single: "⏹ Sending stopped for +{phone}.",
        resume_single: "▶️ +{phone} started again.", enter_again: "🔄 Enter your phone number again (with '+'):",
        source_prompt: "📥 Where should messages be taken from?",
        source_saved_btn: "💾 Saved Messages",
        source_custom_btn: "🔗 Custom Channel/Group/Bot",
        enter_source: "📢 Send the username (@) or link of the channel/group/bot to take messages from:",
        invalid_source: "❌ Could not access the provided source. Please send a valid username/link.",
        source_set_saved: "✅ Source: Saved Messages.",
        source_set_custom: "✅ Source set to: {target}",
        cancel_btn: "❌ Cancel",
        groups_btn: "📋 Manage Groups",
        source_btn: "📥 Manage Source",
        delete_btn: "🗑 Delete Number",
        back_btn: "🔙 Back",
        del_group_btn: "❌ Delete: {group}",
        del_source_btn: "❌ Delete source (revert to Saved Messages)",
        no_groups: "❌ No groups have been added.",
        confirm_delete_num: "❗️ Are you sure you want to delete +{phone}? This cannot be undone!",
        confirm_delete_num_yes: "✅ Yes, delete",
        confirm_delete_num_no: "❌ No",
        num_deleted: "✅ +{phone} has been deleted from the system.",
        group_deleted: "✅ Group deleted.",
        source_deleted: "✅ Source deleted, now using Saved Messages.",
        add_group_btn: "➕ Add New Group",
        change_source_btn: "🔄 Change Source",
        admin_phone_change_prompt: "🔔 Admin changed your number. Enter the OTP sent to your new number:",
    },
    ru: {
        sub_msg: "Подпишитесь на следующие каналы:", sub_btn: "✅ Подтвердить подписки", checking: "⏳ Проверка подписки...",
        confirmed: "✅ Подтверждено!", not_subscribed: "❌ Вы ещё не подписались на все каналы! Пожалуйста, сначала подпишитесь на каналы и проверьте снова.",
        menu_unlic: "Пожалуйста, активируйте лицензию:", btn_act_lic: "🔑 Активировать лицензию",
        btn_buy_lic: "🛒 Купить лицензию / Поддержка", btn_price: "📋 Прайс-лист", btn_web: "🌐 Наш сайт",
        menu_lic: "✅ Лицензия активна! Главное меню:", btn_add_num: "➕ Добавить новый номер", btn_manage: "⚙️ Мои аккаунты (Номера)",
        enter_lic: "Введите код лицензии (Напр: ELITE-12345):", invalid_lic: "❌ Неверный формат кода лицензии.",
        not_found_lic: "❌ Такой лицензии нет в базе данных!", blocked_lic: "❌ Эта лицензия заблокирована!",
        used_lic: "❌ Эта лицензия уже используется другим пользователем!", success_lic: "✅ Лицензия успешно подтверждена!",
        no_lic: "❌ У вас нет активной лицензии.", limit_reached: "❌ Вы достигли лимита лицензии (Максимум: {max} номеров).",
        enter_phone: "📱 Введите номер Telegram, который хотите подключить к боту (с '+', напр: +994501234567):",
        no_numbers: "⚠️ Пока не добавлено ни одного номера.", my_accounts: "⚙️ *Ваши активные аккаунты:*\n\n",
        stopped: "🔴 Остановлен", active: "🟢 Активен", stop_btn: "Остановить: +", resume_btn: "Запустить: +", back_main: "🔙 Главное меню",
        phone_format: "⚠️ Номер должен начинаться с '+'!", otp_sent: "⏳ Отправка OTP-кода, подождите...",
        otp_info: "📩 Код безопасности отправлен. Введите код с пробелами между цифрами (напр: 8 8 9 9 0):\n\nЕсли вы ввели неверный номер, напишите /changenumber.",
        err: "❌ Ошибка: ", sess_lost: "⚠️ Сессия удалена из памяти. Пожалуйста, начните процесс заново.",
        login_success: "✅ Вход в аккаунт {phone} выполнен успешно!\n\nТеперь отправьте *имя пользователя* (напр: @имягруппы) или *ссылку* группы, куда будут отправляться сообщения:",
        otp_err: "❌ Неверный OTP или на аккаунте включена двухфакторная аутентификация (2FA). Ошибка: ",
        group_added: "✅ Группа добавлена. (Сейчас для этого номера {count} групп(а))\n\nХотите добавить ещё одну группу или продолжить?",
        add_more: "➕ Добавить ещё группу", finish_btn: "✅ Завершить и продолжить", send_group: "Отправьте *имя пользователя* или *ссылку* группы, которую хотите добавить:",
        ask_interval: "✅ Группы подтверждены. Теперь укажите число, через сколько минут будет отправляться сообщение (напр: 2, 3, 5):",
        interval_err: "⚠️ Пожалуйста, введите число от 2 до 60.",
        bot_started: "✅ *Бот запущен ({phone})!*\n\nБот будет отправлять сообщения из выбранного источника в целевые группы каждые {min} минут.",
        ch1_btn: "📢 Обязательный канал 1", ch2_btn: "📢 Обязательный канал 2", all_stopped: "⏹ Все аккаунты остановлены.", stop_single: "⏹ Отправка для +{phone} остановлена.",
        resume_single: "▶️ +{phone} снова запущен.", enter_again: "🔄 Введите ваш номер телефона заново (с '+'):",
        source_prompt: "📥 Откуда брать сообщения?",
        source_saved_btn: "💾 Избранное (Saved Messages)",
        source_custom_btn: "🔗 Свой канал/группа/бот",
        enter_source: "📢 Отправьте имя пользователя (@) или ссылку на канал/группу/бота, откуда будут взяты сообщения:",
        invalid_source: "❌ Не удалось получить доступ к указанному источнику. Пожалуйста, укажите корректное имя/ссылку.",
        source_set_saved: "✅ Источник: Избранное.",
        source_set_custom: "✅ Источник установлен: {target}",
        cancel_btn: "❌ Отмена",
        groups_btn: "📋 Управление группами",
        source_btn: "📥 Управление источником",
        delete_btn: "🗑 Удалить номер",
        back_btn: "🔙 Назад",
        del_group_btn: "❌ Удалить: {group}",
        del_source_btn: "❌ Удалить источник (вернуться к Избранному)",
        no_groups: "❌ Группы не добавлены.",
        confirm_delete_num: "❗️ Вы уверены, что хотите удалить +{phone}? Это действие необратимо!",
        confirm_delete_num_yes: "✅ Да, удалить",
        confirm_delete_num_no: "❌ Нет",
        num_deleted: "✅ +{phone} удалён из системы.",
        group_deleted: "✅ Группа удалена.",
        source_deleted: "✅ Источник удалён, теперь используются Избранные сообщения.",
        add_group_btn: "➕ Добавить группу",
        change_source_btn: "🔄 Изменить источник",
        admin_phone_change_prompt: "🔔 Администратор изменил ваш номер. Введите OTP, отправленный на новый номер:",
    }
};

function t(key, lang = 'az', params = {}) {
    let text = i18n[lang]?.[key] || i18n['az'][key] || key;
    for (const [k, v] of Object.entries(params)) { text = text.replace(`{${k}}`, v); }
    return text;
}

// ------------------------------------------------------------------
// Firebase əməliyyatları
// ------------------------------------------------------------------
async function getDB(path) {
  try { const res = await fetch(`${FIREBASE_URL}/${path}.json`); return await res.json(); } catch (e) { return null; }
}
async function setDB(path, data) {
  try { await fetch(`${FIREBASE_URL}/${path}.json`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (e) { console.error(e); }
}

// ------------------------------------------------------------------
// Bot profil yenilənməsi
// ------------------------------------------------------------------
let currentDesc = "", currentShortDesc = "";
setInterval(async () => {
    const settings = await getDB('settings');
    if (settings) {
        if (settings.botDescription !== undefined && settings.botDescription !== currentDesc) {
            currentDesc = settings.botDescription;
            try {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ description: settings.botDescription || "" })
                });
                console.log("Botun əsas təsviri yeniləndi.");
            } catch(e) { console.error(e); }
        }
        if (settings.botShortDescription !== undefined && settings.botShortDescription !== currentShortDesc) {
            currentShortDesc = settings.botShortDescription;
            try {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyShortDescription`, {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ short_description: settings.botShortDescription || "" })
                });
                console.log("Botun qısa bioqrafiyası yeniləndi.");
            } catch(e) { console.error(e); }
        }
    }
}, 15000);

// ------------------------------------------------------------------
// Köməkçi funksiyalar
// ------------------------------------------------------------------
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

async function sendOrUpdateScreen(chatId, text, options = {}) {
    try {
        const msgId = mainMessageIds.get(chatId);
        if (msgId) {
            await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, ...options });
            return;
        }
    } catch (e) {
        // redaktə mümkün olmadı, yeni mesaj göndər
    }
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
        inline_keyboard.push([{ text: t('btn_buy_lic', lang), url: settings.support || "https://t.me/EliteNetworkk" }]);
        inline_keyboard.push([{ text: t('btn_price', lang), url: settings.priceUrl || "https://t.me/EliteBotMedia/13" }]);
        inline_keyboard.push([{ text: t('btn_web', lang), url: settings.website || "https://t.me/EliteBotMedia" }]);
        await sendOrUpdateScreen(chatId, t('menu_unlic', lang), { reply_markup: { inline_keyboard } });
    } else {
        inline_keyboard.push([{ text: t('btn_add_num', lang), callback_data: "add_new_number" }]);
        inline_keyboard.push([{ text: t('btn_manage', lang), callback_data: "manage_numbers" }]);
        await sendOrUpdateScreen(chatId, t('menu_lic', lang), { reply_markup: { inline_keyboard } });
    }
}

// ------------------------------------------------------------------
// /start
// ------------------------------------------------------------------
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  mainMessageIds.delete(chatId);
  await setDB(`users/${chatId}/state`, "START");

  const settings = await getDB('settings') || {};
  const startPhoto = settings.startPhotoUrl || null;
  if (startPhoto) {
    try {
      await bot.sendPhoto(chatId, startPhoto);
    } catch (e) { console.error("Şəkil göndərilmədi:", e.message); }
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
// /stop, /changenumber, /sifirla
// ------------------------------------------------------------------
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
  await sendOrUpdateScreen(chatId, t('enter_again', userLang));
});

bot.onText(/\/sifirla (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    let numToReset = match[1].replace(/\+/g, '').replace(/\s+/g, '');
    await setDB(`users/${chatId}/accounts/${numToReset}`, null);
    await setDB(`users/${chatId}/state`, "IDLE");
    delete userSessions[chatId];
    bot.sendMessage(chatId, `✅ +${numToReset} nömrəsi sistemdən tamamilə sıfırlandı!`);
});

// ------------------------------------------------------------------
// Bütün callback sorğuları
// ------------------------------------------------------------------
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";
  await bot.answerCallbackQuery(query.id);

  // Ləğv
  if (data === "cancel_operation") {
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, "IDLE");
    return showMainMenu(chatId, userLang);
  }

  // Dil seçimi
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
    await sendOrUpdateScreen(chatId, t('sub_msg', lang), { reply_markup: keyboard });
    return;
  }

  // Abunəlik yoxlanışı
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
          [{ text: t('sub_btn', userLang), callback_data: "check_subscription" }]
        ]
      };
      await sendOrUpdateScreen(chatId, t('not_subscribed', userLang), { reply_markup: keyboard });
      return;
    }
  }

  // Lisenziya daxiletmə
  if (data === "enter_license") {
    await setDB(`users/${chatId}/state`, "AWAITING_LICENSE");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
    return sendOrUpdateScreen(chatId, t('enter_lic', userLang), { reply_markup: keyboard });
  }

  // Yeni nömrə əlavə et
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
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
      return sendOrUpdateScreen(chatId, t('enter_phone', userLang), { reply_markup: keyboard });
  }

  // Hesabları idarə et (yeni interfeys)
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
            { text: (acc.status === "ACTIVE" ? t('stop_btn', userLang) : t('resume_btn', userLang)) + phone, callback_data: `toggle_${phone}` },
            { text: t('delete_btn', userLang), callback_data: `delete_${phone}` }
          ]);
      }
      inline_keyboard.push([{ text: t('back_main', userLang), callback_data: "back_to_main" }]);
      return sendOrUpdateScreen(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  // Toggle dayandır/başlat
  if (data.startsWith("toggle_")) {
      const phoneKey = data.replace("toggle_", "");
      const acc = await getDB(`users/${chatId}/accounts/${phoneKey}`);
      if (acc) {
        const newStatus = acc.status === "ACTIVE" ? "STOPPED" : "ACTIVE";
        await setDB(`users/${chatId}/accounts/${phoneKey}/status`, newStatus);
        bot.sendMessage(chatId, newStatus === "STOPPED" ? t('stop_single', userLang, { phone: phoneKey }) : t('resume_single', userLang, { phone: phoneKey }));
        // Geri: manage_numbers yenidən göstər
        return bot.emit('callback_query', { message: query.message, data: 'manage_numbers', id: query.id, from: query.from });
      }
      return showMainMenu(chatId, userLang);
  }

  // Qrupları idarə et
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
      return sendOrUpdateScreen(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  // Qrup sil
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

  // Yeni qrup əlavə et (state təyin et)
  if (data.startsWith("addgroup_")) {
      const phoneKey = data.replace("addgroup_", "");
      await setDB(`users/${chatId}/currentPhoneSetup`, "+" + phoneKey);
      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
      return sendOrUpdateScreen(chatId, t('send_group', userLang), { parse_mode: "Markdown", reply_markup: keyboard });
  }

  // Mənbə idarə et
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
      return sendOrUpdateScreen(chatId, msg, { parse_mode: "Markdown", reply_markup: { inline_keyboard } });
  }

  // Mənbəni sil (saved et)
  if (data.startsWith("delsource_")) {
      const phoneKey = data.replace("delsource_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}/messageSource`, { type: "saved" });
      bot.sendMessage(chatId, t('source_deleted', userLang));
      return bot.emit('callback_query', { message: query.message, data: `source_${phoneKey}`, id: query.id, from: query.from });
  }

  // Mənbəni dəyiş (xüsusi mənbə təyin et)
  if (data.startsWith("changesource_")) {
      const phoneKey = data.replace("changesource_", "");
      await setDB(`users/${chatId}/currentPhoneSetup`, "+" + phoneKey);
      await setDB(`users/${chatId}/state`, "AWAITING_CUSTOM_SOURCE");
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
      return sendOrUpdateScreen(chatId, t('enter_source', userLang), { reply_markup: keyboard });
  }

  // Nömrəni sil (təsdiq)
  if (data.startsWith("delete_")) {
      const phoneKey = data.replace("delete_", "");
      const keyboard = {
        inline_keyboard: [
          [{ text: t('confirm_delete_num_yes', userLang), callback_data: `confirm_delete_${phoneKey}` }],
          [{ text: t('confirm_delete_num_no', userLang), callback_data: "manage_numbers" }]
        ]
      };
      return sendOrUpdateScreen(chatId, t('confirm_delete_num', userLang, { phone: phoneKey }), { reply_markup: keyboard });
  }

  // Təsdiqlənmiş silmə
  if (data.startsWith("confirm_delete_")) {
      const phoneKey = data.replace("confirm_delete_", "");
      await setDB(`users/${chatId}/accounts/${phoneKey}`, null);
      // Lisensiyadan da sil
      const user = await getDB(`users/${chatId}`);
      if (user && user.activeLicense) {
        await setDB(`licenses/${user.activeLicense}/registeredPhones/${phoneKey}`, null);
      }
      bot.sendMessage(chatId, t('num_deleted', userLang, { phone: phoneKey }));
      delete userSessions[chatId];
      await setDB(`users/${chatId}/state`, "IDLE");
      return showMainMenu(chatId, userLang);
  }

  // Geri: Ana menyu
  if (data === "back_to_main") {
    await setDB(`users/${chatId}/state`, "IDLE");
    delete userSessions[chatId];
    return showMainMenu(chatId, userLang);
  }

  // Qrup əlavəsini davam et / bitir (əvvəlki aşağıda)
  if (data === "add_more_group") {
    await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
    return sendOrUpdateScreen(chatId, t('send_group', userLang), { parse_mode: "Markdown", reply_markup: keyboard });
  }

  if (data === "finish_groups") {
    await setDB(`users/${chatId}/state`, "AWAITING_SOURCE");
    const keyboard = {
      inline_keyboard: [
        [{ text: t('source_saved_btn', userLang), callback_data: "source_saved" }],
        [{ text: t('source_custom_btn', userLang), callback_data: "source_custom" }],
        [{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]
      ]
    };
    return sendOrUpdateScreen(chatId, t('source_prompt', userLang), { reply_markup: keyboard });
  }

  // Mesaj mənbəyi seçildi
  if (data === "source_saved") {
    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');
    await setDB(`users/${chatId}/accounts/${phoneKey}/messageSource`, { type: "saved" });
    await setDB(`users/${chatId}/state`, "AWAITING_INTERVAL");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
    return sendOrUpdateScreen(chatId, t('ask_interval', userLang), { reply_markup: keyboard });
  }

  if (data === "source_custom") {
    await setDB(`users/${chatId}/state`, "AWAITING_CUSTOM_SOURCE");
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
    return sendOrUpdateScreen(chatId, t('enter_source', userLang), { reply_markup: keyboard });
  }
});

// ------------------------------------------------------------------
// Yazılı mesajların qəbulu (State‑ə əsasən)
// ------------------------------------------------------------------
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const userLang = (await getDB(`users/${chatId}/lang`)) || "az";
  const state = await getDB(`users/${chatId}/state`);

  if (text === t('cancel_btn', userLang)) {
    delete userSessions[chatId];
    await setDB(`users/${chatId}/state`, "IDLE");
    return showMainMenu(chatId, userLang);
  }

  // Lisenziya
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

  // Telefon nömrəsi
  if (state === "AWAITING_PHONE") {
    if (!text.startsWith("+")) return bot.sendMessage(chatId, t('phone_format', userLang));
    const waitMsg = await bot.sendMessage(chatId, t('otp_sent', userLang));
    try {
      const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 5 });
      await client.connect();
      const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, text);
      userSessions[chatId] = { client, phone: text, phoneCodeHash };
      await setDB(`users/${chatId}/currentPhoneSetup`, text);
      await setDB(`users/${chatId}/state`, "AWAITING_OTP");
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
      return sendOrUpdateScreen(chatId, t('otp_info', userLang), { reply_markup: keyboard });
    } catch (err) {
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(()=>{});
      bot.sendMessage(chatId, t('err', userLang) + err.message);
    }
    return;
  }

  // OTP
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
      // Lisensiyaya nömrəni qeyd et
      const user = await getDB(`users/${chatId}`);
      if (user && user.activeLicense) {
        await setDB(`licenses/${user.activeLicense}/registeredPhones/${phoneKey}`, true);
      }
      await setDB(`users/${chatId}/state`, "AWAITING_GROUP");
      const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
      return sendOrUpdateScreen(chatId, t('login_success', userLang, { phone: sessionData.phone }), { parse_mode: "Markdown", reply_markup: keyboard });
    } catch (err) {
      bot.sendMessage(chatId, t('otp_err', userLang) + err.message);
    }
    return;
  }

  // Hədəf qrup
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
        [{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]
      ]
    };
    return sendOrUpdateScreen(chatId, t('group_added', userLang, { count: existing.length }), { reply_markup: keyboard });
  }

  // Xüsusi mənbə
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
    const keyboard = { inline_keyboard: [[{ text: t('cancel_btn', userLang), callback_data: "cancel_operation" }]] };
    return sendOrUpdateScreen(chatId, t('ask_interval', userLang), { reply_markup: keyboard });
  }

  // İnterval
  if (state === "AWAITING_INTERVAL") {
    const min = parseInt(text);
    if (isNaN(min) || min < 2 || min > 60) return bot.sendMessage(chatId, t('interval_err', userLang));
    const currentPhone = await getDB(`users/${chatId}/currentPhoneSetup`);
    const phoneKey = currentPhone.replace('+', '');
    await setDB(`users/${chatId}/accounts/${phoneKey}/intervalMinutes`, min);
    await setDB(`users/${chatId}/accounts/${phoneKey}/lastSentAt`, 0);
    await setDB(`users/${chatId}/accounts/${phoneKey}/status`, "ACTIVE");
    await setDB(`users/${chatId}/state`, "IDLE");
    delete userSessions[chatId];
    return sendOrUpdateScreen(chatId, t('bot_started', userLang, { phone: currentPhone, min: min }), { parse_mode: "Markdown" });
  }
});

// ------------------------------------------------------------------
// Admin tərəfindən nömrə dəyişikliyini yoxlama (hər 15 saniyə)
// ------------------------------------------------------------------
setInterval(async () => {
  const users = await getDB("users");
  if (!users) return;
  for (const chatId in users) {
    const user = users[chatId];
    if (user.pendingPhoneChange) {
      const newPhone = user.pendingPhoneChange.newPhone;
      const lang = user.lang || "az";
      // OTP göndər
      try {
        const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, { connectionRetries: 3 });
        await client.connect();
        const { phoneCodeHash } = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, newPhone);
        userSessions[chatId] = { client, phone: newPhone, phoneCodeHash };
        await setDB(`users/${chatId}/currentPhoneSetup`, newPhone);
        await setDB(`users/${chatId}/state`, "AWAITING_OTP");
        await setDB(`users/${chatId}/pendingPhoneChange`, null); // təmizlə
        bot.sendMessage(chatId, t('admin_phone_change_prompt', lang), {
          reply_markup: { inline_keyboard: [[{ text: t('cancel_btn', lang), callback_data: "cancel_operation" }]] }
        });
        console.log(`${chatId} üçün admin nömrə dəyişdi: ${newPhone}`);
      } catch (e) {
        console.error(`Admin phone change error for ${chatId}:`, e.message);
        await setDB(`users/${chatId}/pendingPhoneChange`, null);
        bot.sendMessage(chatId, t('err', lang) + e.message);
      }
    }
  }
}, 15000);

// ------------------------------------------------------------------
// Avtomatik göndərim (30 saniyədən bir)
// ------------------------------------------------------------------
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
            const messageToSend = sourceMessages[0].text || sourceMessages[0].message;
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