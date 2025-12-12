# 🎮 CrushIT – Full Stack React Native + Web Sports Ecosystem

A multi-platform booking, shopping, and PetCare experience built using:

✔ React Native + Expo (Android, iOS & Web)  
✔ Node.js + Express Mock API backend  
✔ Stylish UI kit + modular screens  
✔ Mock data + DB schema for production scaling

---

## 🚀 Features

✔ Arena discovery & booking  
✔ Merchandise store  
✔ PetCare service booking  
✔ Women-only game mode  
✔ Rewards & points redemption  
✔ Chatbot assistant  
✔ Supports Android, iOS & Web with *one codebase*

---

## 🧩 Tech Stack

### Frontend (Cross-Platform)
- React Native
- Expo (builds Web + Android + iOS)
- React Navigation

### Backend
- Node.js
- Express.js
- Mock database (in-memory datasets)

---

## 📁 Project Structure

crushit-fullstack/
│
├── app/                # Cross-platform React Native app
│   ├── App.tsx
│   └── src/
│       ├── screens/    # Home, Arenas, Shop, PetCare, Profile
│       ├── components/ # ArenaCard, ProductCard, PetCareCard, Chip
│       ├── navigation/ # Bottom tab navigator
│       └── theme/      # Styling & theme colors
│
└── backend/            # API backend with mock data
    ├── src/
    │   ├── index.ts    # REST API server
    │   └── data/       # Mock datasets
    │
    └── models/         # DB schemas (for real expansion later)

---

## 🔌 Backend API

Base URL: http://localhost:4000

✔ /arenas – arenas list  
✔ /products – merchandise + pet store  
✔ /petcare – partner services  
✔ /user/:id – user details + points  

---

## 🎨 Design System

Dark mode inspired Neo-sport UI

primary:   #5A00FF
accent:    #00A8FF
bg:        #0B0B12
surface:   #14141F
text:      #FFFFFF
textMuted: #9FA0B5
pet:       #21C78A

Rounded cards, gradient buttons & animated tabs.

---

## 📱 Screens Included

✔ Home  
✔ Arenas list  
✔ Shop  
✔ PetCare  
✔ Profile  

All styled for Web, iOS, Android via Expo.

---

## 🗃 Recommended DB Tables (for real backend)

Users  
Arenas  
Products  
PetCarePartners  
Orders  
Bookings  
Rewards  

---

## ▶️ Run Locally

Backend
cd backend
npm install
npm run dev

Frontend
cd app
npm install
npm start

Press:
a → Android
i → iOS
w → Web

---

## 📌 Roadmap

### Phase 1
✔ UI screens  
✔ Mock backend  
✔ Arena & Shop UI  

### Phase 2
🛠 Auth, Wallet, Dynamic Data  

### Phase 3  
🤖 Assistant, AI recommendations, Live bookings  

---

## 🤝 Contributing

PRs & feedback welcome!

---

## ⭐️ Support
If this repository helps you — star it ❤️
