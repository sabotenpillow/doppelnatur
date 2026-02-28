"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Role, RoleConfig } from "@/types/game";

const ROLE_NAMES: Record<Role, string> = {
  werewolf: "人狼",
  villager: "村人",
  seer: "占い師",
  medium: "霊媒師",
  knight: "騎士",
  madman: "狂人",
  fox: "狐",
  twins: "双子",
};

const AVAILABLE_ROLES: Role[] = ["werewolf", "villager", "seer", "medium", "knight", "madman", "fox", "twins"];

export default function RoomPage() {
  const router = useRouter();
  const { roomState, isConnected, leaveRoom, setRoles, startGame } = useWebSocket();
  const [roleConfigs, setRoleConfigs] = useState<Record<Role, number>>({
    werewolf: 1,
    villager: 3,
    seer: 1,
    medium: 0,
    knight: 0,
    madman: 0,
    fox: 0,
    twins: 0,
  });

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (roomState?.state === "playing") {
      router.push("/game");
    }
  }, [roomState?.state, router]);

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/");
  };

  const handleRoleChange = (role: Role, delta: number) => {
    setRoleConfigs((prev) => ({
      ...prev,
      [role]: Math.max(0, prev[role] + delta),
    }));
  };

  const handleSetRoles = () => {
    const roles: RoleConfig[] = AVAILABLE_ROLES.filter(
      (role) => roleConfigs[role] > 0
    ).map((role) => ({
      role,
      count: roleConfigs[role],
    }));

    setRoles(roles);
  };

  const handleStartGame = () => {
    startGame();
  };

  const totalRoles = Object.values(roleConfigs).reduce((sum, count) => sum + count, 0);
  const playerCount = roomState?.players?.length || 0;
  const isAdmin = roomState?.players?.find((p) => p.isAdmin)?.id === roomState?.adminId;
  const rolesValid = totalRoles === playerCount && totalRoles > 0;

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">待機ルーム</h1>
              <p className="text-gray-600">部屋コード: <span className="font-mono font-bold text-blue-600">{roomState.code}</span></p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              退室する
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">参加者 ({playerCount}名)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {roomState.players?.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg ${
                    player.isAdmin ? "bg-yellow-100 border-2 border-yellow-400" : "bg-gray-100"
                  }`}
                >
                  <p className="font-medium text-gray-800">
                    {player.nickname}
                    {player.isAdmin && <span className="ml-2 text-xs text-yellow-600">管理者</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && roomState.state === "waiting" && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                役職設定 (合計: {totalRoles} / 参加者: {playerCount})
              </h2>
              <div className="space-y-3 mb-4">
                {AVAILABLE_ROLES.map((role) => (
                  <div key={role} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">{ROLE_NAMES[role]}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRoleChange(role, -1)}
                        className="w-8 h-8 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
                        disabled={roleConfigs[role] === 0}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold">{roleConfigs[role]}</span>
                      <button
                        onClick={() => handleRoleChange(role, 1)}
                        className="w-8 h-8 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSetRoles}
                  disabled={!rolesValid}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  役職を設定
                </button>
                <button
                  onClick={handleStartGame}
                  disabled={!rolesValid || roomState.roleConfigs.length === 0}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ゲーム開始
                </button>
              </div>

              {!rolesValid && totalRoles > 0 && (
                <p className="text-red-600 text-sm mt-2">
                  役職の合計人数が参加者数と一致していません
                </p>
              )}
            </div>
          )}

          {!isAdmin && (
            <div className="border-t pt-6 text-center text-gray-600">
              <p>管理者がゲームの設定を行っています...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
