"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useLanguage } from "@/context/LanguageContext";
import { Role, RoleConfig } from "@/types/game";
import { UserX } from "lucide-react";

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
  const { roomState, isConnected, leaveRoom, setRoles, startGame, kickPlayer } = useWebSocket();
  const { t } = useLanguage();
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

  const handleKickPlayer = (playerId: string, playerName: string) => {
    if (confirm(t("room.kickConfirm", { name: playerName }))) {
      kickPlayer(playerId);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">待機ルーム</h1>
              <p className="text-sm sm:text-base text-gray-600">部屋コード: <span className="font-mono font-bold text-blue-600">{roomState.code}</span></p>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              退室する
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">{t("room.participants")} ({t("room.participantsCount", { count: playerCount })})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {roomState.players?.map((player) => (
                <div
                  key={player.id}
                  className={`p-2 sm:p-3 rounded-lg flex items-center justify-between ${
                    player.isAdmin ? "bg-yellow-100 border-2 border-yellow-400" : "bg-gray-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                      {player.nickname}
                      {player.isAdmin && <span className="ml-1 sm:ml-2 text-xs text-yellow-600">{t("room.admin")}</span>}
                    </p>
                  </div>
                  {isAdmin && !player.isAdmin && roomState.state === "waiting" && (
                    <button
                      onClick={() => handleKickPlayer(player.id, player.nickname)}
                      className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={t("room.kick")}
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isAdmin && roomState.state === "waiting" && (
            <div className="border-t pt-4 sm:pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                役職設定 (合計: {totalRoles} / 参加者: {playerCount})
              </h2>
              <div className="space-y-2 sm:space-y-3 mb-4">
                {AVAILABLE_ROLES.map((role) => (
                  <div key={role} className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">{ROLE_NAMES[role]}</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleRoleChange(role, -1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors text-sm sm:text-base"
                        disabled={roleConfigs[role] === 0}
                      >
                        -
                      </button>
                      <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base">{roleConfigs[role]}</span>
                      <button
                        onClick={() => handleRoleChange(role, 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors text-sm sm:text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleSetRoles}
                  disabled={!rolesValid}
                  className="flex-1 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  役職を設定
                </button>
                <button
                  onClick={handleStartGame}
                  disabled={!rolesValid || roomState.roleConfigs.length === 0}
                  className="flex-1 py-2 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  ゲーム開始
                </button>
              </div>

              {!rolesValid && totalRoles > 0 && (
                <p className="text-red-600 text-xs sm:text-sm mt-2">
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
