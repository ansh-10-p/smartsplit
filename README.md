SmartSplit — Split Smart. Pay Easy.

# ⚡ SmartSplit — Split Smart. Pay Easy.

SmartSplit is an AI-assisted **group expense and bill-splitting web app** built with React, Tailwind, Framer Motion, and Shadcn UI.  
It helps users manage shared expenses with **AI categorization**, **fun payment reminders (with memes!)**, and a **mock UPI PayNow system** — all inside a **modern Galactic-themed UI**.

---

## 🚀 Live Demo  
https://smartsplit-zgm8-2hve8nghu-ansh-10-ps-projects.vercel.app

---

## 🧠 Tech Stack

| Layer | Technologies Used |
|-------|-------------------|
| **Frontend Framework** | React 19 + Vite |
| **Styling & UI** | Tailwind CSS + Shadcn/UI |
| **Icons & Animations** | Lucide React + Framer Motion |
| **Routing** | React Router v7 |
| **State Management & Auth** | React Context API |
| **Payments (Mock)** | UPI-style simulated PayNow component |
| **Data Storage** | Local JSON mock / browser state |

---

## ⚙️ App Flow

User Login → Dashboard → Create Group → Add Expense → Split Share  
↓  
AI Categorization + Smart Summary  
↓  
Fun Meme-Based Reminder + Mock PayNow

---

## 🧩 Features

### 💸 Expense Management
- Add, view, and categorize group expenses.
- Real-time split calculation per user.
- AI-style tags for food, travel, etc.

### 💰 UPI “Pay Now” Concept
- Simulated UPI mock screen.
- Neon payment UI (no real money transfer).

### 🔔 Meme-Based Payment Reminders
- Get reminded to pay through random fun memes.
- Interactive “Pay Now” and “Next Meme” buttons.

### 🌓 Dark Mode Toggle
- Seamless transition between light and dark themes.
- Saves user preference for consistent UX.

### 📊 Smart Summary
- Displays group totals, individual shares, and recent transactions.

### 👥 Group Management
- Create, manage, and view expense groups.
- AI-based suggestions for fair split distribution (planned).

---

## 🧱 Folder Structure

smartsplit/
├── public/
│   ├── vite.svg
│   └── logo.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Summary.jsx
│   │   ├── Group.jsx
│   │   ├── Reminders.jsx
│   │   └── PayNow.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── context/AuthContext.jsx
├── tailwind.config.js
├── package.json
└── README.md

---

## 🪄 Installation & Setup

### 1️⃣ Clone the repository
git clone https://github.com/<your-username>/smartsplit.git
cd smartsplit

### 2️⃣ Install dependencies
npm install

### 3️⃣ Run the app
npm run dev

App runs on → http://localhost:5173

---

## 🧠 Environment Setup (Optional)
If you plan to connect real APIs (Firebase, MongoDB, Stripe), create a `.env` file:

VITE_API_URL=<your_api_url>
VITE_FIREBASE_KEY=<your_key>

---

## 🌈 UI Sneak Peek

| Screen | Preview |
|--------|----------|
| **Home** | Split Smart. Pay Easy landing page with neon cards. |
| **Dashboard** | View all group expenses and manage members. |
| **Summary** | Quick insights of all transactions. |
| **Reminders** | Meme-based fun reminders + UPI mock payments. |

---

## 🧩 Good-to-Have (Planned Features)

✅ Smart AI expense categorization (via NLP)  
✅ Meme API integration (to fetch trending payment memes)  
✅ WhatsApp/Email reminders  
✅ Stripe or Razorpay integration for real UPI-like payments  
✅ Group chat & expense history tracking  
✅ Export expense reports as PDF  

---

## 💻 Developer Notes

- Tailwind utility classes are extended with custom colors (`--gp-1` to `--gp-4`).
- The design follows a Galactic Neon theme for consistency.
- All components are fully functional (no placeholders).
- Built to be easily extended into a full-stack project.

---

## 🧑💻 Author

**Ansh Pandey**  
✨ Passionate  Developer | UI/UX Enthusiast | Tech Innovator  
📬 Connect: GitHub | LinkedIn

---

## 🪐 License

This project is licensed under the MIT License — free to use and modify.

