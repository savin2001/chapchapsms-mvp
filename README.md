# ChapChapSMS 🚀📨

**ChapChapSMS** is a lean, Kenyan-built SMS messaging platform designed for fast, reliable bulk and interactive SMS delivery. Built for startups, SMEs, and developers seeking an affordable, extensible messaging tool.

---

## 🔧 MVP Tech Stack (StackBlitz-Friendly)

| Layer       | Tech Stack                                 | Rationale |
|-------------|---------------------------------------------|-----------|
| Frontend    | React + TypeScript + Tailwind CSS           | Fast UI prototyping with live preview |
| Backend     | Express.js (Node.js + TypeScript)           | Lightweight, easy to extend, browser-compatible |
| Database    | Supabase (PostgreSQL + Auth)                | Free-tier, integrated auth + DB |
| SMS Gateway | Africa's Talking Sandbox API                | Local SMS support with sandbox for dev |
| Auth        | Supabase Auth / Firebase Auth               | Easy to set up, built-in session handling |
| Queue (Opt) | BullMQ / Simulated in-memory jobs           | For scheduled/batched messages |
| DevOps      | GitHub + Vercel / Railway / Supabase deploy | No Docker needed to ship prototype |
| Email       | Resend / EmailJS                            | For alerts, verification |
| Monitoring  | Browser logs + Supabase logs (MVP phase)    | Avoids ELK stack until needed |

---

## 📦 Features (MVP)
- ✅ Send SMS to one or many users via Africa's Talking
- ✅ Dashboard to view message logs
- ✅ Simple user login with Supabase Auth
- 🚧 Scheduled sending (Queue placeholder)
- 🚧 Analytics (delivery stats, message costs)

---

## 🔄 Setup (Dev Mode)

1. **Frontend**: React (Tailwind) – hosted on StackBlitz/Vercel
2. **Backend**: Express.js API for sending SMS and handling callbacks
3. **Database**: Supabase setup with `messages` and `users` table
4. **Environment Variables** (Backend):
    ```env
    AFRICASTALKING_USERNAME=your_sandbox_username
    AFRICASTALKING_APIKEY=your_sandbox_api_key
    SUPABASE_URL=https://xyz.supabase.co
    SUPABASE_KEY=public_anon_key
    ```

---

## 📩 Sample SMS Request (Backend)
```ts
POST /api/send-sms
{
  "to": "+2547XXXXXXXX",
  "message": "Welcome to ChapChapSMS!"
}
```

---

## ✨ Roadmap
- Webhook support for delivery reports
- Scheduled & recurring campaigns
- Inbound SMS management (shortcode/toll-free support)
- Admin billing dashboard
- Advanced role-based access

---

## 🤝 Credits
Built with ❤️ by Kenyan devs for African businesses.