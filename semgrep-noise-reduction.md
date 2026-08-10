# Semgrep Gurultu Azaltma - Oncesi/Sonrasi Karsilastirmasi

## Amac
`.semgrepignore` dosyasi ile, onceden triyaj edilmis ve bilinen yalanci pozitif 
/ kabul edilebilir risk olarak siniflandirilmis dosya/klasorleri Semgrep 
taramasindan haric tutarak SAST gurultusunu azaltmak.

## Haric Tutulan Yollar

| Yol | Gerekce |
|---|---|
| `juice-shop/data/static/codefixes/**` | CTF challenge kodu, uygulamanin calisan route akisinda import edilmiyor, sadece egitim amacli statik referans metni (triyaj-tablosu.md'de "Kabul Edilebilir Risk" olarak belgelendi) |
| `**/test/**`, `**/*.spec.ts`, `**/*.test.ts` | Mock/ornek veri iceren test dosyalari, uretim kodu degil |
| `juice-shop/.github/workflows/**` | Juice Shop'un kendi orijinal CI/CD dosyalari, bu projenin remediation kapsaminin disinda, ayri bir pipeline guvenligi konusu olarak triyaj-tablosunda not edildi |
| `**/node_modules/**` | Ucuncu parti kod, zaten SCA araclariyla (npm audit, Trivy) ayrica taraniyor |

## Olcum Sonuclari

| Durum | Taranan Dosya | Bulgu Sayisi |
|---|---|---|
| **Oncesi** (.semgrepignore olmadan) | 995 | 46 |
| **Sonrasi** (.semgrepignore ile) | 706 | 24 |

**Azalma:** 46 - 24 = 22 bulgu  
**Gurultu azaltma orani:** 22/46 ≈ **%47.8**

## Yorum

`.semgrepignore` dosyasi, onceden manuel triyaj sureci ile "yalanci pozitif" 
veya "kabul edilebilir risk" olarak belgelenmis kod alanlarini (esas olarak 
CTF egitim iceriği ve test dosyalari) tarama disina cikararak, gelistiricinin 
her taramada gercek/kritik bulgulara odaklanmasini sagliyor. Kalan 24 bulgu, 
uygulamanin gercek route/controller kodundaki potansiyel sorunlari ve 
uygulamanin kendi orijinal test/ornek kodlarindaki (test disi kalan ama 
henuz triyaj edilmemis) noktalari icermektedir; bunlarin detayli triyaji 
triyaj-tablosu.md dosyasinda mevcuttur.