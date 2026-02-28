"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WebSocketClient } from "@/lib/websocket";
import { RoomState } from "@/types/game";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const ws = new WebSocketClient(WS_URL);
    wsRef.current = ws;

    ws.connect()
      .then(() => {
        setIsConnected(true);
      })
      .catch((err) => {
        console.error("Failed to connect:", err);
        setError("接続に失敗しました");
      });

    ws.on("room_created", (data) => {
      console.log("Room created:", data);
    });

    ws.on("room_state", (data) => {
      console.log("Room state updated:", data);
      setRoomState(data);
    });

    ws.on("player_joined", (data) => {
      console.log("Player joined:", data);
    });

    ws.on("player_left", (data) => {
      console.log("Player left:", data);
    });

    ws.on("player_kicked", (data) => {
      console.log("Player kicked:", data);
    });

    ws.on("kicked", (data) => {
      console.log("You were kicked:", data);
      setError("あなたは管理者により退室させられました");
      // Clear room state
      setRoomState(null);
    });

    ws.on("roles_updated", (data) => {
      console.log("Roles updated:", data);
    });

    ws.on("game_started", (data) => {
      console.log("Game started:", data);
    });

    ws.on("error", (data) => {
      console.error("Error from server:", data);
      setError(data.message);
    });

    return () => {
      ws.disconnect();
    };
  }, []);

  const createRoom = useCallback((nickname: string) => {
    if (wsRef.current) {
      wsRef.current.send("create_room", { nickname });
    }
  }, []);

  const joinRoom = useCallback((roomCode: string, nickname: string) => {
    if (wsRef.current) {
      wsRef.current.send("join_room", { roomCode, nickname });
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send("leave_room");
    }
  }, []);

  const setRoles = useCallback((roles: any[]) => {
    if (wsRef.current) {
      wsRef.current.send("set_roles", { roles });
    }
  }, []);

  const startGame = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send("start_game");
    }
  }, []);

  const kickPlayer = useCallback((targetPlayerId: string) => {
    if (wsRef.current) {
      wsRef.current.send("kick_player", { targetPlayerId });
    }
  }, []);

  return {
    isConnected,
    roomState,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    setRoles,
    startGame,
    kickPlayer,
  };
}
