# MAHALAKSHMI HOSPITAL — Centralized Multi-Device & Cloud Hospital Management System (HMS)

**Hospital Location:** Kasturivari Street (Ramamahal Ladies Gate Street), R.R.Pet Main Road, Eluru, Andhra Pradesh 534002  
**Stack:** React 18 + TypeScript + Tailwind CSS + Recharts + PWA (Frontend) | Java 21 + Spring Boot 3.2 REST API + Spring Security JWT/BCrypt (Backend) | PostgreSQL 18 (Centralized Relational Database).

---

## 1. Multi-Device & Progressive Web App (PWA) Support

The Mahalakshmi Hospital Management System is engineered to run seamlessly across:
- **Windows PCs & Laptops**, **MacBooks**, **Android Smartphones & Tablets**, **iPhones**, and **iPads** (Chrome, Edge, Safari, Firefox).
- **Installable PWA**: Includes [`manifest.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/mahalakshmi-hms/frontend/public/manifest.json), custom SVG medical icons, iOS/Android meta tags, and a security-hardened Service Worker ([`sw.js`](file:///C:/Users/hp/.gemini/antigravity/scratch/mahalakshmi-hms/frontend/public/sw.js)) that caches **only static UI shell assets** and **strictly never caches `/api/*` or confidential clinical/patient records** in browser `localStorage` or offline cache.
- **Real-Time Multi-Device Synchronization**: Every connected device polls `/api/sync/status` and tracks the central PostgreSQL audit watermark so updates made on one device automatically synchronize across all authorized staff screens.

---

## 2. Environment Separation (`dev`, `test`, `prod`)

- **Development (`SPRING_PROFILES_ACTIVE=dev`)**: [`application-dev.properties`](file:///C:/Users/hp/.gemini/antigravity/scratch/mahalakshmi-hms/backend/src/main/resources/application-dev.properties)
- **Testing (`SPRING_PROFILES_ACTIVE=test`)**: [`application-test.properties`](file:///C:/Users/hp/.gemini/antigravity/scratch/mahalakshmi-hms/backend/src/main/resources/application-test.properties)
- **Production (`SPRING_PROFILES_ACTIVE=prod`)**: [`application-prod.properties`](file:///C:/Users/hp/.gemini/antigravity/scratch/mahalakshmi-hms/backend/src/main/resources/application-prod.properties) — Strictly enforces environment-injected `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` with zero hardcoded fallbacks, disables demo credential listing, and hides stack traces.

---

## 3. Production Docker & HTTPS Deployment Instructions

1. **Create Your Protected `.env` File**:
   ```powershell
   Copy-Item .env.example .env
   ```
   Edit `.env` and set strong values for `DB_USERNAME`, `DB_PASSWORD`, and a 64+ character `JWT_SECRET`. (`.env` is ignored by Git via [`.gitignore`](file:///C:/Users/hp/.gemini/antigravity/scratch/mahalakshmi-hms/.gitignore)).

2. **Launch Production Stack with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```
   - **PostgreSQL 18 (`mahalakshmi-hms-db`)**: Runs strictly inside the isolated `hms_internal` (`internal: true`) network with **no public port exposure** and a `pg_isready` health check.
   - **Spring Boot Backend (`mahalakshmi-hms-backend`)**: Waits for `postgres` health before starting (`condition: service_healthy`), runs as a non-root user (`hmsuser`), mounts persistent `/app/secure-storage/reports`, and exposes `/api/health`.
   - **Nginx HTTPS Reverse Proxy (`mahalakshmi-hms-nginx`)**: Redirects HTTP (`80`) to HTTPS (`443`), enforces TLS 1.2/1.3, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, blocks direct public access to `/secure-storage/`, and proxies `/api/` to the internal backend with `Cache-Control: no-store`.

---

## 4. Automated Database & Document Vault Backup and Restore

- **Run Automated Backup** (PostgreSQL SQL dump + Medical Reports Vault archive):
  ```powershell
  .\scripts\backup-db.ps1
  ```
- **Restore from Backup**:
  ```powershell
  .\scripts\restore-db.ps1 -SqlFile .\backups\mahalakshmi_hms_YYYYMMDD_HHMMSS.sql
  ```

---

## 5. Hospital Onboarding, Bulk CSV/Excel Import & Export

Navigate to **18. Onboarding, Import & Export** in the sidebar to:
1. Download ready-made `.CSV` templates for **Patients**, **Doctors**, and **Staff**.
2. Upload or paste CSV records and click **Preview, Validate & Check Duplicates**.
3. Inspect **Valid Rows**, **Duplicate Rows (Protected — never overwritten silently)**, and **Invalid Rows**.
4. Commit validated records to PostgreSQL and download the **Import Error & Duplicate Report (`.CSV`)**.
5. Export authorized datasets (**Patients, Doctors, Invoices, Lab Reports, Audit Logs**) to Excel-compatible `.CSV` or Print/PDF.
