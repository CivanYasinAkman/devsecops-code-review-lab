# Bulgu Triyajı (Doğru Pozitif / Yalancı Pozitif / Kabul Edilebilir Risk)

## Özet İstatistikler

| Kaynak | Ham Bulgu | Triyaj Edilen | Doğru Pozitif | Yalancı Pozitif | Kabul Edilebilir Risk |
|---|---|---|---|---|---|
| Manuel İnceleme | 10 | 10 | 10 | 0 | 0 |
| Gitleaks | 149 | 149 | 0 | 149 | 0 |
| Semgrep (Error) | 18 | 13 | 4 | 4 | 5 |
| Trivy / npm audit | 176 | - | - | - | - (örneklem bazlı, aşağıda) |

**Not:** Trivy (image/iac/fs) ve npm audit'in tüm ham bulguları (176 adet) tek tek triyaj edilmemiştir; proje hedefi doğrultusunda örneklem (Critical/High severity) üzerinden triyaj yapılmıştır. Kalan düşük öncelikli bulgular toplu olarak "gözden geçirilecek, kritik değil" notuyla işaretlenmiştir.

---

## 1. Manuel İnceleme Bulguları (Tümü Doğru Pozitif — PoC ile Doğrulandı)

| No | Zafiyet Türü | Dosya:Satır | Sınıflandırma | CWE | CVSS | Gerekçe |
|---|---|---|---|---|---|---|
| M1 | Broken Access Control (Scoreboard) | frontend/src/app/app.routing.ts | Doğru Pozitif | CWE-284 | 5.3 | AuthGuard eksik, önceki pentest'te sömürüldü |
| M2 | SQL Injection (Login) | routes/login.ts:34 | Doğru Pozitif | CWE-89 | 9.8 | Parametresiz sorgu, Semgrep tarafından da tespit edildi (çapraz doğrulama) |
| M3 | DOM XSS (Search) | frontend/src/app/search-result/search-result.component.ts | Doğru Pozitif | CWE-79 | 6.1 | DomSanitizer.bypassSecurityTrustHtml() ile zararlı JS çalıştırıldı |
| M4 | IDOR / BOLA (Basket) | routes/baskets.ts | Doğru Pozitif | CWE-639 | 6.5 | Aktif oturumdaki kullanıcı ID kontrolü yapılmıyor |
| M5 | Brute Force (Login) | routes/login.ts | Doğru Pozitif | CWE-307 | 5.3 | Hız sınırlandırma / account lockout mekanizması yok |
| M6 | CSRF (Password Change) | routes/changePassword.ts | Doğru Pozitif | CWE-352 | 6.5 | GET isteğiyle şifre değiştirme tetiklendi, Anti-CSRF token yok |
| M7 | LFI / Vulnerable Components | routes/fileServer.ts | Doğru Pozitif | CWE-22 | 7.5 | Null byte (%00) ile uzantı doğrulaması atlatılabiliyor |
| M8 | Mass Assignment (Admin Register) | routes/register.ts, models/User.ts | Doğru Pozitif | CWE-915 | 8.1 | Body'deki role:"admin" filtrelenmeden create()'e geçiyor |
| M9 | Code Injection/RCE (B2B Order Processing) | routes/b2bOrder.ts | Doğru Pozitif | CWE-94 | 8.2 | vm.runInContext ile kullanıcı girdisi (orderLinesData) JavaScript kodu olarak çalıştırılıyordu; sandbox escape ile process.exit() gibi tehlikeli komutlar çalıştırılabiliyordu. (Not: İlk triyajda "XXE" olarak yanlış sınıflandırılmıştı, kod incelemesinde gerçek zafiyetin XML ile ilgisi olmadığı tespit edildi.) |
| M10 | Open Redirect | routes/redirect.ts | Doğru Pozitif | CWE-601 | 4.7 | to parametresi whitelist kontrolünden geçmiyor |

---

## 2. Gitleaks Bulguları (149 Ham Bulgu — Tamamı Yalancı Pozitif)

| Grup | Kapsam | Adet | Sınıflandırma | Gerekçe |
|---|---|---|---|---|
| Test dosyaları | `test/` dizini altında (*.spec.ts, *.test.ts, *Spec.js) | 143 | Yalancı Pozitif | CI/test ortamına özgü mock JWT token ve örnek credential; üretim kodunda kullanılmıyor |
| Base64 "secret" | routes/login.ts:66, routes/login.js:65, routes/login.js:72, data/static/users.yml:37 | 4 | Yalancı Pozitif | Base64 decode edilince `bjoern.kimminich@gmail.com` (geliştiricinin e-postası, tersten yazılmış) çıkıyor — kasıtlı bir "easter egg", gerçek kimlik bilgisi değil |
| Ethereum adresi | frontend/src/app/faucet/faucet.component.ts:828 | 1 | Yalancı Pozitif | `0x...` formatı bir public blockchain cüzdan adresi, API key/secret değil |
| Diğer | data/static/users.yml:151 (generic-secret) | 1 | Yalancı Pozitif | Seed/demo veri dosyası, hardcoded ama uygulama seed'i olarak kasıtlı |

**Yalancı pozitif oranı: 149/149 = %100** (Bu araç için; genel oran hesaplaması diğer araçlarla birlikte aşağıda.)

---

## 3. Semgrep Bulguları (Error Seviyesi — 18 Bulgu)

| Grup | Dosya:Satır | Sınıflandırma | CWE | CVSS | Gerekçe |
|---|---|---|---|---|---|
| SQL Injection | routes/login.ts:34 | Doğru Pozitif | CWE-89 | 9.8 | M2 ile aynı bulgu — SAST + manuel çakışması |
| SQL Injection | routes/search.ts:23 | Doğru Pozitif | CWE-89 | 9.1 | Parametresiz sequelize.query, arama kutusundan tetiklenebilir |
| Property Injection | routes/currentUser.ts:31 | Doğru Pozitif | CWE-915 | 6.5 | requestedFields üzerinden mass assignment / hassas alan sızıntısı riski |
| Eval Injection/SSTI | routes/userProfile.ts | Doğru Pozitif | CWE-95 | 8.6 | Username alanına #{...} formatında değer girilirse eval() ile JavaScript kodu olarak çalıştırılıyordu. (Not: İlk triyajda "String Concat Injection/CWE-89" olarak yanlış sınıflandırılmıştı, kod incelemesinde gerçek zafiyetin eval() tabanlı kod enjeksiyonu olduğu tespit edildi.) |
| CTF Challenge Kodu (4 adet) | data/static/codefixes/*.ts | Kabul Edilebilir Risk | CWE-89 | 3.1 (düşürülmüş) | Kod, uygulamanın çalışan route akışında import edilmiyor; sadece "hangi satır güvensiz" CTF sorusu için statik referans metni olarak sunuluyor (routes/vulnCodeFixes.ts üzerinden okunuyor, execute edilmiyor) |
| CI/CD Shell Injection (5 adet) | .github/workflows/ci.yml:358, update-challenges-*.yml | Doğru Pozitif (ayrı kategori) | CWE-78 | 8.8 | GitHub Actions workflow'unda güvensiz shell/curl-pipe kullanımı; pipeline güvenliği kapsamında ayrıca ele alınacak |
| Secret Detection (JWT, test dosyaları — 3 adet) | app.guard.spec.ts:46, last-login-ip.component.spec.ts:72/78 | Yalancı Pozitif | - | - | Gitleaks Grup 1 ile aynı gerekçe — test mock verisi |
| Generic Secret | data/static/users.yml:151 | Yalancı Pozitif | - | - | Gitleaks ile çakışan aynı bulgu, seed veri |

---

## 4. Trivy / npm audit — Kritik Örneklem

| Kaynak | Bulgu | Sınıflandırma | CWE | CVSS | Gerekçe |
|---|---|---|---|---|---|
| Trivy (image) | 7 adet CRITICAL CVE (base image paketleri) | Doğru Pozitif | CWE-1104 (Kullanımdan kalkmış bileşen) | Değişken (CVE bazlı, ortalama 9.0+) | Base image güncel değil; FixedVersion alanı dolu olanlar öncelikli düzeltilecek |
| npm audit (backend) | 7 adet Critical (bağımlılık) | Doğru Pozitif | CWE-1104 | Değişken | package-lock.json güncellenerek düzeltilebilir, `npm audit fix` ile test edilecek |
| npm audit (frontend) | 0 Critical, 5 High | Kabul Edilebilir Risk (şimdilik) | CWE-1104 | - | Angular ekosistemindeki dolaylı (transitive) bağımlılıklar, doğrudan exploit yolu tespit edilmedi |
| Trivy (config/IaC) | 2 adet HIGH (Dockerfile) | Doğru Pozitif | CWE-250 (Gereksiz yetki) | 7.2 | Container root kullanıcıyla çalışıyor, USER directive eksik |

---

## Genel Yalancı Pozitif Oranı (Baseline Karşılaştırması İçin)
Toplam triyaj edilen bulgu: 10 (manuel) + 149 (Gitleaks) + 18 (Semgrep Error) + 15 (Trivy/npm audit örneklem) = 192
Doğru Pozitif: 10 + 0 + 9 + 3 = 22
Yalancı Pozitif: 0 + 149 + 4 = 153
Kabul Edilebilir Risk: 0 + 0 + 5 + 1 = 6

Yalancı Pozitif Oranı: 153/192 ≈ %79.7

Bu oran, Hafta 3'te özel Semgrep kuralları ve `.gitleaksignore` / baseline dosyaları eklendikten sonra tekrar ölçülüp öncesi-sonrası karşılaştırması yapılacaktır.