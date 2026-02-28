export type Role = "werewolf" | "villager" | "seer" | "medium" | "knight" | "madman" | "fox" | "twins";

export type GameState = "waiting" | "playing" | "ended";

export interface Player {
  id: string;
  nickname: string;
  role?: Role;
  isAlive: boolean;
  isAdmin: boolean;
}

export interface RoleConfig {
  role: Role;
  count: number;
}

export interface RoomState {
  code: string;
  players: Player[];
  roleConfigs: RoleConfig[];
  state: GameState;
  adminId: string;
}

export interface WSMessage {
  type: string;
  payload?: Record<string, any>;
  roomCode?: string;
  playerId?: string;
}
