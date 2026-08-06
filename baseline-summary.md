# DevSecOps Baseline (Başlangıç) Ölçüm Tablosu

Projenin sıfır noktasında (hiçbir yapılandırma yapılmadan) varsayılan ayarlarla elde edilen ham bulgu sayıları aşağıdadır:

| Araç | Sürüm | Tarama Türü | Kapsam | Komut | Ham Bulgu | Tekil | Severity Kırılımı | Eksik/Timeout | Tarih | Durum |
|---|---|---|---|---|---|---|---|---|---|---|
| Trivy | 0.72.0 | Container Image | bkimminich/juice-shop:latest | `trivy image bkimminich/juice-shop --format json --output trivy-image-report.json` | 99 | 99 | Critical:7, High:46, Medium:34, Low:12 | - | 2026-08-04 | Tamamlandı |
| Trivy | 0.72.0 | IaC / Config | Dockerfile, docker-compose.yml | `trivy config . --format json --output trivy-iac-report.json` | 6 | 6 | High:2, Medium:2, Low:2 | - | 2026-08-04 | Tamamlandı |
| Trivy | 0.72.0 | Secret Scanning (fs, çapraz doğrulama) | Tüm repo (frontend + lib) | `trivy fs . --format json --output trivy-fs-report.json` | 3 | 3 | High:1, Medium:2 | - | 2026-08-04 | Tamamlandı |
| Semgrep | 1.172.0 | SAST | Tüm repo | `semgrep --config auto --json --output semgrep-report.json .` | 51 | 51 | Error:18, Warning:28, Medium:2, Info:3 | - | 2026-08-04 | Tamamlandı |
| Gitleaks | 8.30.1 | Secret Scanning | Tüm repo (git geçmişi dahil) | `gitleaks detect --source . --report-format json --report-path gitleaks-report.json` | 149 | 149 | - | - | 2026-08-04 | Tamamlandı |
| npm audit | 11.12.1 | SCA (Bağımlılık Taraması) | Backend (root package.json) | `npm audit --json` | 47 | 47 | Critical:7, High:22, Moderate:15, Low:3 | - | 2026-08-04 | Tamamlandı |
| npm audit | 11.12.1 | SCA (Bağımlılık Taraması) | Frontend (Angular, frontend/package.json) | `npm audit --json` (frontend klasöründe) | 24 | 24 | High:5, Moderate:7, Low:12 | - | 2026-08-04 | Tamamlandı |