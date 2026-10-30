# Saurabh Yagyik — Senior Flutter Developer Portfolio Platform

Personal developer portfolio, production application showcase, and persistent recruiter inquiry system powered by **Express, TypeScript, and SQLite (`node:sqlite`)**.

Designed and built around the professional resume of **Saurabh Yagyik**, highlighting 3+ years of commercial cross-platform mobile engineering for Android & iOS, published store applications, Clean Architecture, and database-backed inquiries.

---

## 🌟 Features

- **🎨 Modern Dark Theme**: Refined typography, deep neutral tones (`#090a0f`), and subtle accents (Linear / Vercel style).
- **📱 5 Published Mobile Applications**:
  1. **PriyStore** — Flutter eCommerce custom garment printing app (*Android*)
  2. **Gaelic Stats App** — Sports analytics & match tracking (*Android & iOS*)
  3. **Aks Bus** — Regional bus reservation platform (*Android*)
  4. **Ten CRM** — Enterprise sales pipeline tracker (*Android & iOS*)
  5. **Sports Pro** — Live sports HLS streaming platform (*Android*)
- **🗄️ Persistent SQLite Database (`data/portfolio.db`)**:
  - Relational schema with automatic seeding on first boot.
  - Tables: `profile`, `skills`, `experience`, `projects`, `education`, `contact_messages`, `project_likes`, `guestbook`, `site_metrics`.
- **📬 Private Inquiries Dashboard (`/inquiries` and `/admin`)**:
  - Dedicated page for viewing incoming recruiter queries.
  - One-click `mailto:` reply, WhatsApp chat link, CSV lead export, and deletion.
- **📄 Direct Resume PDF**: Serves the official resume at `/resume`.
- **❤️ Live Upvoting**: Visitors can upvote projects directly into SQLite.

---

## 🌐 Routes & Endpoints

| Route | Description |
|---|---|
| `GET /` | Public Portfolio Website |
| `GET /resume` | Download / View Resume PDF |
| `GET /inquiries` | Private Inquiries & Recruiter Messages Dashboard |
| `GET /health` | Health Check |
| `GET /api/portfolio/data` | Full Portfolio Payload (JSON) |
| `POST /api/portfolio/contact` | Submit Contact Inquiry (Persisted to SQLite) |
| `GET /api/portfolio/messages` | List Inquiries (JSON) |
| `GET /api/portfolio/messages/export/csv` | Download Inquiries Spreadsheet (CSV) |
| `POST /api/portfolio/projects/:id/like` | Upvote Project in SQLite |

---

## 🚀 Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev

# 3. Build & start production server
npm run build
npm start
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 👨‍💻 About Saurabh Yagyik
- **Role**: Senior Flutter Developer
- **Email**: [saurabhyagyik123@gmail.com](mailto:saurabhyagyik123@gmail.com)
- **Phone**: [+91 9140937250](tel:+919140937250)
- **LinkedIn**: [linkedin.com/in/saurabh-yagyik-273b59215](https://www.linkedin.com/in/saurabh-yagyik-273b59215)
- **GitHub**: [github.com/SAURABHYAGYIK9140](https://github.com/SAURABHYAGYIK9140)

