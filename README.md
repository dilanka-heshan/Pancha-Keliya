# 🐦 Pancha Keliya - Traditional Sri Lankan New Year Board Game

Pancha Keliya is a digital remake of a beloved Sri Lankan traditional New Year multiplayer board game. This web app brings the joy of strategic movement, chance, and cultural celebration to your screen with real-time multiplayer gameplay, vibrant visuals, and engaging animations.

## 🎮 Game Overview

Pancha Keliya is a two-player game played on a 96-cell board where:
- Each player has a path of 78 cells.
- 6 unique starting cells ➡️ 60 overlapping cells ➡️ 12 unique ending cells.
- Players move in opposite directions:
  - Player 1: clockwise
  - Player 2: counter-clockwise
- Tokens enter the board on a dice roll of **1** or **5**.
- Safe zones (cells divisible by 6) protect tokens from being "cut" (captured).
- First to move all parrots to the end wins!

## ✨ Features

- 🎲 Dice roll animations and sound effects
- 🧩 Real-time multiplayer with Socket.IO
- 🔀 Drag-and-drop token movement
- 🛡️ Safe zones and knockout logic
- 📊 Game state syncing via Supabase
- 📱 Responsive and mobile-friendly interface
- 🇱🇰 Inspired by authentic Sri Lankan cultural elements

## 🧪 Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO Client](https://socket.io/)

**Backend:**
- Next.js API Routes
- [Socket.IO Server](https://socket.io/)
- [Supabase](https://supabase.io/) (PostgreSQL + Realtime)

**Deployment:**
- [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.x
- Yarn or npm
- Supabase project & keys
- Vercel account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/dilanka-heshan/pancha-keliya.git


# Install dependencies
npm install

# Add environment variables
cp .env.example .env.local
# Fill in your Supabase credentials and Socket.IO config in .env.local

# Start the dev server
npm run dev
