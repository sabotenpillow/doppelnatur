"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import RoleCard from "@/components/RoleCard";

export default function GamePage() {
  const router = useRouter();
  const { roomState, isConnected, leaveRoom } = useWebSocket();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (roomState?.state === "waiting") {
      router.push("/room");
    }
  }, [roomState?.state, router]);

  const handleLeaveGame = () => {
    leaveRoom();
    router.push("/");
  };

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">読み込み中...</p>
      </div>
    );
  }

  const myPlayer = roomState.players?.find((p) => p.id);
  const myRole = myPlayer?.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ゲーム進行中</h1>
              <p className="text-gray-600">部屋コード: <span className="font-mono font-bold text-blue-600">{roomState.code}</span></p>
            </div>
            <button
              onClick={handleLeaveGame}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              退出する
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Role Card */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">あなたの役職</h2>
              <RoleCard role={myRole} autoReveal={true} />
            </div>

            {/* Players List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">参加者一覧</h2>
              <div className="grid grid-cols-2 gap-2">
                {roomState.players?.map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg ${
                      player.isAlive ? "bg-green-100" : "bg-gray-200"
                    }`}
                  >
                    <p className="font-medium text-gray-800">
                      {player.nickname}
                      {!player.isAlive && <span className="ml-2 text-xs text-red-600">死亡</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-6 text-center">
            <p className="text-gray-600 mb-4">
              ゲームが開始されました。ゲーム進行機能は次のフェーズで実装されます。
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">次のフェーズで実装予定</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 昼・夜のターン制御</li>
                <li>• 投票システム</li>
                <li>• 各役職の能力実行</li>
                <li>• 勝敗判定</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
