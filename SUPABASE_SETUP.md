# 🚀 Supabase Setup Guide - Production Backend

## Step 1: Create Supabase Project

1. Go to **https://supabase.com**
2. Click **"New Project"**
3. Fill in:
   - **Project Name:** `kitabi-interactive` (or your choice)
   - **Password:** Create a strong password
   - **Region:** Choose closest to your location
4. Click **"Create new project"** → Wait 2-3 minutes

## Step 2: Get Your Credentials

1. After project creates, go to **Settings → API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Public Key:** `eyJhbGc...`
3. **KEEP THESE SAFE** — Don't share them publicly

## Step 3: Add Database Schema

1. Click **SQL Editor** in left sidebar
2. Click **New Query**
3. **Copy this entire SQL script:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('child', 'parent', 'teacher')) DEFAULT 'parent',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  avatar TEXT DEFAULT '👦',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Child progress table
CREATE TABLE public.child_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL UNIQUE REFERENCES public.children(id) ON DELETE CASCADE,
  stars INTEGER DEFAULT 0,
  texts_read TEXT DEFAULT '{}',
  games_played INTEGER DEFAULT 0,
  minutes_spent INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Diagnostic results table
CREATE TABLE public.diagnostic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  interpretation TEXT,
  results_json TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skill scores table
CREATE TABLE public.skill_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  skill_type TEXT CHECK (skill_type IN ('segment', 'sound', 'position', 'assembly', 'rhyme', 'vowels')),
  score INTEGER DEFAULT 0,
  games_attempted INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(child_id, skill_type)
);

-- User settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  font_size INTEGER DEFAULT 32,
  sound_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Parents can see their children" ON public.children
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update their children" ON public.children
  FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Users can see progress of their children" ON public.child_progress
  FOR SELECT USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings 2" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);
```

4. Paste into the query box
5. Click **Run** (or Ctrl+Enter)
6. Wait for ✅ Success message

## Step 4: Update Your Code

In `supabase-client.js`, replace:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE';
```

With your actual values:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGc...';
```

## Step 5: Test It

1. Open your app in browser
2. Check console (F12) for "✅ Supabase initialized"
3. Try signing up with a test account
4. Check Supabase Dashboard → Auth to see your user created

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase not available" | Check script loading order in `index.html` |
| SQL errors | Make sure you ran the entire script (scroll to see errors) |
| Auth not working | Verify SUPABASE_URL and SUPABASE_KEY are correct |
| RLS policy error | Try disabling RLS temporarily: SQL Editor → Run `ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;` |

## Next Steps

Once working:
1. ✅ Update `app.jsx` to use real authentication
2. ✅ Deploy to Vercel
3. ✅ Enable production security

**You're all set! Your platform now has a real backend.** 🎉
