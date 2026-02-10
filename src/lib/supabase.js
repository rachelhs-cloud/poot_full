import { createClient } from '@supabase/supabase-js';

// These will be replaced by environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// ROOM MANAGEMENT
// ============================================

export async function createRoom(gameType, hostName) {
  const code = generateRoomCode();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      game_type: gameType,
      host_name: hostName,
      status: 'waiting',
      game_state: {},
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinRoom(code, playerName) {
  // First, get the room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (roomError) throw new Error('Room not found');
  if (room.status !== 'waiting') throw new Error('Game already started');

  // Add player to room
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      name: playerName,
      is_host: false,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (playerError) throw playerError;
  return { room, player };
}

export async function getRoom(code) {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      players (*)
    `)
    .eq('code', code.toUpperCase())
    .single();

  if (error) throw error;
  return data;
}

export async function updateGameState(roomId, gameState) {
  const { error } = await supabase
    .from('rooms')
    .update({ game_state: gameState, updated_at: new Date().toISOString() })
    .eq('id', roomId);

  if (error) throw error;
}

export async function updateRoomStatus(roomId, status) {
  const { error } = await supabase
    .from('rooms')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', roomId);

  if (error) throw error;
}

export async function sendGameAction(roomId, playerId, actionType, actionData) {
  const { error } = await supabase
    .from('game_actions')
    .insert({
      room_id: roomId,
      player_id: playerId,
      action_type: actionType,
      action_data: actionData,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToRoom(roomId, onUpdate) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        onUpdate({ type: 'room', data: payload.new });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onUpdate({ type: 'player', event: payload.eventType, data: payload.new });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'game_actions',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onUpdate({ type: 'action', data: payload.new });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToPlayers(roomId, onUpdate) {
  const channel = supabase
    .channel(`players:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// PRESENCE (who's online)
// ============================================

export function trackPresence(roomCode, playerInfo, onPresenceChange) {
  const channel = supabase.channel(`presence:${roomCode}`, {
    config: {
      presence: {
        key: playerInfo.id,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresenceChange(Object.values(state).flat());
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Player joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Player left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(playerInfo);
      }
    });

  return () => {
    channel.untrack();
    supabase.removeChannel(channel);
  };
}

// ============================================
// BROADCAST (instant messages)
// ============================================

export function createBroadcastChannel(roomCode, onMessage) {
  const channel = supabase
    .channel(`broadcast:${roomCode}`)
    .on('broadcast', { event: 'game_event' }, ({ payload }) => {
      onMessage(payload);
    })
    .subscribe();

  const send = (eventData) => {
    channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: eventData,
    });
  };

  return {
    send,
    unsubscribe: () => supabase.removeChannel(channel),
  };
}

// ============================================
// HELPERS
// ============================================

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function isSupabaseConfigured() {
  return supabaseUrl && supabaseAnonKey;
}
