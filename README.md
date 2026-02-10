# 🐾 poot games

> touch grass later 🌱

A collection of tiny, fun games to play solo or with friends — with real-time multiplayer!

## 🎮 Games

- 🌍 **Country Guesser** - Name all countries starting with a letter
- 🤔 **21 Questions** - Classic guessing game
- 🔗 **Word Chain** - Link words by their last/first letter
- 🃏 **Vändtia** - Swedish card shedding game
- 🧽 **Secret SpongeBob** - Social deduction in Bikini Bottom

---

## 🚀 Quick Deploy to Vercel

### Step 1: Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"**
3. Give it a name (e.g., `poot-games`)
4. Set a database password (save this!)
5. Wait for the project to be created (~2 minutes)

### Step 2: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **"Run"** (or Cmd/Ctrl + Enter)
5. You should see "Success" for all commands

### Step 3: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Deploy to Vercel

#### Option A: Deploy with Git (Recommended)

1. Push this folder to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
5. Click **Deploy**!

#### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (it will ask for env vars)
vercel

# For production
vercel --prod
```

#### Option C: Drag & Drop

1. Run `npm run build` locally
2. Drag the `dist` folder to [vercel.com/new](https://vercel.com/new)
3. Add environment variables in project settings

---

## 🔧 Environment Variables

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

For Vercel, add these in:
**Project Settings** → **Environment Variables**

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Create .env file with your Supabase keys
cp .env.example .env
# Edit .env with your actual keys

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
poot-games/
├── src/
│   ├── App.jsx              # Main game component
│   ├── main.jsx             # React entry point
│   └── lib/
│       ├── supabase.js      # Supabase client & functions
│       └── useMultiplayer.js # React hook for multiplayer
├── supabase/
│   └── schema.sql           # Database schema (run this first!)
├── public/
│   └── panda.svg            # Cute favicon
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

---

## 🎯 How Multiplayer Works

1. **Create Room**: Host creates a room, gets a 6-character code
2. **Share Code**: Friends enter the code to join
3. **Real-time Sync**: Supabase Realtime keeps everyone in sync
4. **Play!**: Game state updates instantly for all players

### Supabase Features Used:
- **Database**: Stores rooms, players, game state
- **Realtime**: Instant updates via PostgreSQL changes
- **Presence**: Shows who's online
- **Broadcast**: Instant messaging for game events

---

## 🔒 Security Notes

- The `anon` key is safe to expose (it's meant for client-side)
- Row Level Security (RLS) is enabled on all tables
- Rooms auto-delete after 24 hours
- No user authentication required (anonymous play)

---

## 🐛 Troubleshooting

**"Supabase not configured"**
- Make sure your `.env` file has the correct keys
- Restart the dev server after adding env vars

**"Room not found"**
- Check that you ran the SQL schema
- Room codes are case-insensitive

**Players not syncing**
- Check Supabase dashboard → Database → Replication
- Make sure tables are added to `supabase_realtime` publication

**Build errors**
- Run `npm install` to ensure all dependencies are installed
- Check that you're using Node 18+

---

## 📜 License

MIT - Do whatever you want with it!

---

made with 🧡 by a sleepy panda
