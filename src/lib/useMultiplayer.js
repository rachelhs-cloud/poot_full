import { useState, useEffect, useCallback, useRef } from 'react';
import {
  supabase,
  createRoom,
  joinRoom,
  getRoom,
  updateGameState,
  updateRoomStatus,
  sendGameAction,
  subscribeToRoom,
  trackPresence,
  createBroadcastChannel,
  isSupabaseConfigured,
} from './supabase';

// ============================================
// useMultiplayer Hook
// ============================================

export function useMultiplayer(gameType) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [myPlayer, setMyPlayer] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]);

  const broadcastRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const presenceRef = useRef(null);

  // Check if Supabase is configured
  const isConfigured = isSupabaseConfigured();

  // Create a new room
  const create = useCallback(async (hostName) => {
    if (!isConfigured) {
      setError('Supabase not configured');
      return null;
    }

    try {
      setError(null);
      const newRoom = await createRoom(gameType, hostName);
      
      // Add host as first player
      const { data: hostPlayer } = await supabase
        .from('players')
        .insert({
          room_id: newRoom.id,
          name: hostName,
          is_host: true,
        })
        .select()
        .single();

      setRoom(newRoom);
      setMyPlayer(hostPlayer);
      setIsHost(true);
      setPlayers([hostPlayer]);

      return newRoom;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [gameType, isConfigured]);

  // Join existing room
  const join = useCallback(async (code, playerName) => {
    if (!isConfigured) {
      setError('Supabase not configured');
      return null;
    }

    try {
      setError(null);
      const { room: joinedRoom, player } = await joinRoom(code, playerName);
      
      // Get all players
      const roomData = await getRoom(code);
      
      setRoom(joinedRoom);
      setMyPlayer(player);
      setIsHost(false);
      setPlayers(roomData.players || []);

      return joinedRoom;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [isConfigured]);

  // Subscribe to room updates
  useEffect(() => {
    if (!room?.id || !isConfigured) return;

    // Subscribe to database changes
    unsubscribeRef.current = subscribeToRoom(room.id, (update) => {
      if (update.type === 'room') {
        setRoom(prev => ({ ...prev, ...update.data }));
      } else if (update.type === 'player') {
        if (update.event === 'INSERT') {
          setPlayers(prev => [...prev, update.data]);
        } else if (update.event === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === update.data.id ? update.data : p));
        } else if (update.event === 'DELETE') {
          setPlayers(prev => prev.filter(p => p.id !== update.data.id));
        }
      } else if (update.type === 'action') {
        // Handle game actions - this will be processed by the game logic
        console.log('Game action received:', update.data);
      }
    });

    // Track presence
    if (myPlayer) {
      presenceRef.current = trackPresence(
        room.code,
        { id: myPlayer.id, name: myPlayer.name },
        (presences) => {
          setOnlinePlayers(presences);
          setIsConnected(true);
        }
      );
    }

    // Set up broadcast channel for instant messaging
    broadcastRef.current = createBroadcastChannel(room.code, (message) => {
      console.log('Broadcast received:', message);
      // Handle broadcast messages (for instant game updates)
    });

    return () => {
      unsubscribeRef.current?.();
      presenceRef.current?.();
      broadcastRef.current?.unsubscribe();
    };
  }, [room?.id, room?.code, myPlayer, isConfigured]);

  // Update game state
  const updateState = useCallback(async (newState) => {
    if (!room?.id) return;
    try {
      await updateGameState(room.id, newState);
    } catch (err) {
      console.error('Failed to update game state:', err);
    }
  }, [room?.id]);

  // Start the game
  const startGame = useCallback(async (initialState = {}) => {
    if (!room?.id || !isHost) return;
    try {
      await updateRoomStatus(room.id, 'playing');
      await updateGameState(room.id, initialState);
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  }, [room?.id, isHost]);

  // End the game
  const endGame = useCallback(async (finalState = {}) => {
    if (!room?.id) return;
    try {
      await updateRoomStatus(room.id, 'finished');
      await updateGameState(room.id, finalState);
    } catch (err) {
      console.error('Failed to end game:', err);
    }
  }, [room?.id]);

  // Send a game action
  const sendAction = useCallback(async (actionType, actionData) => {
    if (!room?.id || !myPlayer?.id) return;
    try {
      await sendGameAction(room.id, myPlayer.id, actionType, actionData);
    } catch (err) {
      console.error('Failed to send action:', err);
    }
  }, [room?.id, myPlayer?.id]);

  // Broadcast instant message (no database, just realtime)
  const broadcast = useCallback((eventData) => {
    broadcastRef.current?.send({
      ...eventData,
      senderId: myPlayer?.id,
      senderName: myPlayer?.name,
      timestamp: Date.now(),
    });
  }, [myPlayer]);

  // Leave the room
  const leave = useCallback(async () => {
    if (myPlayer?.id) {
      await supabase.from('players').delete().eq('id', myPlayer.id);
    }
    setRoom(null);
    setMyPlayer(null);
    setPlayers([]);
    setIsHost(false);
    setIsConnected(false);
  }, [myPlayer?.id]);

  return {
    // State
    room,
    players,
    myPlayer,
    isHost,
    isConnected,
    isConfigured,
    error,
    onlinePlayers,
    gameState: room?.game_state || {},
    roomCode: room?.code,
    roomStatus: room?.status,

    // Actions
    create,
    join,
    leave,
    startGame,
    endGame,
    updateState,
    sendAction,
    broadcast,
  };
}

export default useMultiplayer;
