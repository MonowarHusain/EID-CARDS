# 🌙 Private Eid Greeting (Eid Capsule)

A zero-knowledge, self-destructing digital envelope built to send beautiful, private Eid wishes. Engineered with a premium "Midnight Glass & Gold" aesthetic and uncrackable client-side encryption.

Created by [Monowar Husain](https://www.mono.bro.bd/).

---




[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-14%20(App%20Router)-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-0055FF?style=flat&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Security](https://img.shields.io/badge/Security-Zero--Knowledge-gold?style=flat&logo=dependabot&logoColor=white)](#-how-the-encryption-works)

---

## ✨ Features

* **Zero-Knowledge Architecture:** Messages are encrypted in the browser using AES-128. The decryption key never touches the server; it is passed exclusively via the URL `#hash`.
* **Military-Grade Security, Elegant UI:** Raw hexadecimal keys are Base64-encoded to keep sharing links short, clean, and URL-safe.
* **Auto-Destruction:** Capsules are programmed to expire and vanish from the database after 30 days.
* **Royal UI/UX:** Built with Tailwind CSS glassmorphism, ambient radial lighting, and physics-based unsealing animations powered by Framer Motion.
* **Secure Feedback Loop:** Integrated Next.js Server Actions to securely route user feedback directly to a private Discord webhook.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 | React framework utilizing the App Router and Server Actions. |
| **Styling** | Tailwind CSS | Utility-first CSS for the premium Midnight Glass & Gold UI. |
| **Animations**| Framer Motion | Smooth, physics-based unsealing transitions. |
| **Database** | Firebase | Cloud Firestore handles encrypted storage and auto-expiration. |
| **Encryption**| CryptoJS | Client-side AES-128 cryptographic engine. |
| **Hosting** | Vercel | Global edge network optimization. |

---

## 🚀 Running Locally

Follow these steps to get your development environment running:

### 1. Clone the Repository
```bash
git clone [https://github.com/MonowarHusain/EID-CARDS.git](https://github.com/MonowarHusain/EID-CARDS.git)
cd EID-CARDS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and add your Firebase configurations:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
DISCORD_WEBHOOK_URL=your_secret_discord_webhook
```

### 4. Launch the Server
```bash
npm run dev
```

---

## 🔒 How the Encryption Works

When a user clicks **"Create"**, the application orchestrates a zero-knowledge handshake locally inside the browser:

```
[ Your Message ] ──( Client-Side AES-128 Encryption )──> [ Encrypted Ciphertext ] ──> Sent to Firestore
                                     │
                        ( Appended to URL Hash )
                                     ▼
                     [https://domain.com/#u9Vb-X7zP_L2Q](https://domain.com/#u9Vb-X7zP_L2Q) (Never sent to Server)
```

> ⚠️ **Security Guarantee:** Because browsers strictly isolate URL hashes (`#`) and do not pass them in network requests to hosting providers or backend databases, the server remains completely blind to your raw message contents. Only the holder of the complete link can decrypt the capsule.
