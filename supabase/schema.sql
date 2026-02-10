-- ============================================
-- POOT GAMES - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Rooms table - stores game sessions
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  game_type VARCHAR(50) NOT NULL,
  host_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
  game_state JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table - stores players in each room
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  player_state JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game actions table - stores moves/actions for replay and sync
CREATE TABLE IF NOT EXISTS game_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_actions_room ON game_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_actions_created ON game_actions(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (for joining)
CREATE POLICY "Anyone can view rooms" ON rooms
  FOR SELECT USING (true);

-- Allow anyone to create rooms
CREATE POLICY "Anyone can create rooms" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update rooms (game state updates)
CREATE POLICY "Anyone can update rooms" ON rooms
  FOR UPDATE USING (true);

-- Allow anyone to view players in a room
CREATE POLICY "Anyone can view players" ON players
  FOR SELECT USING (true);

-- Allow anyone to join as a player
CREATE POLICY "Anyone can join as player" ON players
  FOR INSERT WITH CHECK (true);

-- Allow players to update their own state
CREATE POLICY "Anyone can update players" ON players
  FOR UPDATE USING (true);

-- Allow anyone to view game actions
CREATE POLICY "Anyone can view actions" ON game_actions
  FOR SELECT USING (true);

-- Allow anyone to create game actions
CREATE POLICY "Anyone can create actions" ON game_actions
  FOR INSERT WITH CHECK (true);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_actions;

-- ============================================
-- CLEANUP FUNCTION (optional)
-- ============================================

-- Function to delete old rooms (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms 
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status != 'playing';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
