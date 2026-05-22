# 🌙 Private Eid Greeting (Eid Capsule)

A zero-knowledge, self-destructing digital envelope built to send beautiful, private Eid wishes. Engineered with a premium "Midnight Glass & Gold" aesthetic and uncrackable client-side encryption.

Created by [Monowar Husain](https://www.mono.bro.bd/).

## ✨ Features

* **Zero-Knowledge Architecture:** Messages are encrypted in the browser using AES-128. The decryption key never touches the server; it is passed exclusively via the URL `#hash`.
* **Military-Grade Security, Elegant UI:** Raw hexadecimal keys are Base64-encoded to keep sharing links short, clean, and URL-safe.
* **Auto-Destruction:** Capsules are programmed to expire and vanish from the database after 30 days.
* **Royal UI/UX:** Built with Tailwind CSS glassmorphism, ambient radial lighting, and physics-based unsealing animations powered by Framer Motion.
* **Secure Feedback Loop:** Integrated Next.js Server Actions to securely route user feedback directly to a private Discord webhook.

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **Database:** Firebase Firestore
* **Cryptography:** CryptoJS (AES-128)
* **Deployment:** Vercel

## 🚀 Running Locally

1. Clone the repository:
   ```bash
    git clone https://github.com/MonowarHusain/EID-CARDS.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your `.env.local` file with your Firebase credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔒 How the Encryption Works

When a user clicks "Create", the app generates a 128-bit secret key locally. The message is encrypted, and **only the encrypted gibberish** is sent to Firestore. The secret key is appended to the final URL as a hash (e.g., `/#u9Vb-X7zP_L2Q`). Because browsers do not send URL hashes to servers, the database remains completely blind to the contents of the message.