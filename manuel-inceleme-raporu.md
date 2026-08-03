# Manuel Kod İncelemesi (Source-to-Sink Analizi)

Bu doküman, statik analiz araçlarının (SAST) bulgularını doğrulamak ve araçların kaçırdığı iş mantığı (business logic) zafiyetlerini tespit etmek amacıyla yapılan manuel kod incelemesini içerir.

## Araçların Kaçırdığı Zafiyetler (False Negatives)
SAST araçlarının (Semgrep vb.) uygulamanın iş mantığını ve mimarisini (context) bilememesi nedeniyle kaçırdığı 3 kritik zafiyet tespit edilmiştir:

1. **IDOR / BOLA (Sepet Manipülasyonu)**
   * **Source (Kaynak):** `req.params.id ts:18` (URL'den gelen sepet ID'si)
   * **Sink (Kuyu):** Veritabanı sorgusu (`models.Basket.findOne ts:19`)
   * **Neden Araç Kaçırdı?:** Kodda sözdizimsel bir hata yoktur. Araçlar, talep edilen sepet ID'sinin işlemi yapan kullanıcının oturumuyla (session) eşleşmesi gerektiği iş kuralını bilemez.
2. **Brute Force (Rate Limiting Eksikliği)**
   * **Source:** `req.body.email ts:34` ve `req.body.password ts:34`
   * **Sink:** Veritabanı kimlik doğrulama sorgusu (`models.User.find ts:34`)
   * **Neden Araç Kaçırdı?:** Bu bir kodlama hatası değil, "mimari eksikliktir". Kodun içinde hesabı kilitleyecek veya istekleri sınırlayacak koruyucu bir katman (middleware) hiç yazılmadığı için araçlar yazılmayan bir kodu tespit edemez.
3. **Broken Access Control (Scoreboard Sayfasına Yetkisiz Erişim)**
   * **Source:** Frontend Router (`/#/score-board ts:185-188` URL'si)
   * **Sink:** `ScoreBoardComponent ts:185-188` çağrısı
   * **Neden Araç Kaçırdı?:** Araçlar uygulamanın gereksinim dökümanını bilemez. Hangi sayfanın herkese açık, hangi sayfanın sadece yöneticilere özel olması gerektiğine karar veremezler.

---

## Source-to-Sink Zafiyet Listesi (Manuel İnceleme)
Projenin hedeflediği gibi farklı zafiyet kategorilerinden toplam 10 adet zafiyet manuel olarak incelenmiş ve kaynaktan kuyuya (Source-to-Sink) veri akışları doğrulanmıştır:

| Kategori (CWE/ASVS) | Zafiyet Türü | Source (Zararlı Girdi) | Sink (Tehlikeli İşlem/Çıktı) | İlgili Dosya |
| :--- | :--- | :--- | :--- | :--- |
| **Enjeksiyon (CWE-89)** | SQL Injection (Login) | `req.body.email` | `sequelize.query()` (Parametresiz doğrudan birleştirme) | `routes/login.ts:34` |
| **Çıktı Kodlama (CWE-79)** | DOM XSS (Search) | URL `q` parametresi | `bypassSecurityTrustHtml()` ile doğrudan DOM'a yazım | `frontend/src/app/search-result/search-result.component.ts:143` |
| **Erişim Kontrolü (CWE-285)** | IDOR (Basket) | `req.params.id` | Kimlik doğrulaması olmadan `BasketModel.findOne()` | `routes/baskets.ts:18-19` |
| **Kimlik Doğrulama (CWE-287)** | Brute Force | API İstekleri | Sınırlandırma olmadan `User.find()` | `routes/login.ts:34` |
| **Erişim Kontrolü (CWE-352)** | CSRF (Password Change) | `req.query.new.ts:14-17` | GET isteğiyle tetiklenen `User.update().ts:51` | `routes/changePassword.ts` |
| **Dosya Yükleme (CWE-434)** | LFI / Null Byte Bypass | `req.params.file.ts:16` | Filtreleme yapılmadan `res.sendFile().ts:33` | `routes/fileServer.ts` |
| **Erişim Kontrolü (CWE-915)** | Mass Assignment (Register) | `req.body` (role=admin) | `finale.resource()` (role parametresi exclude edilmemiş) | `server.ts:501-507` |
| **Kod Çalıştırma (CWE-94)** | RCE (B2B Order / Eval) | `req.body.orderLinesData` | Güvensiz `vm.runInContext()` ile `safeEval()` çalıştırılması | `routes/b2bOrder.ts:19-23` |
| **Yönlendirme (CWE-601)** | Open Redirect (GitHub) | `req.query.to.ts:15` | Doğrulama (whitelist) olmayan `res.redirect().ts:19` | `routes/redirect.ts` |
| **Erişim Kontrolü (CWE-285)** | Broken Access Control | Angular Router Yolu | `AuthGuard` olmayan router yönlendirmesi | `frontend/src/app/app.routing.ts:185-188` |

*Not: Yukarıdaki liste, SAST araçlarının tespit yetenekleri ile insan gözüyle yapılan manuel güvenlik kod incelemesi (Secure Code Review) arasındaki tamamlayıcı ilişkiyi kanıtlamaktadır.*