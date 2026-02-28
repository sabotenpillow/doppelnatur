"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { BookOpen } from "lucide-react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { isConnected, createRoom, joinRoom, error } = useWebSocket();
  const { t } = useLanguage();

  const handleCreateRoom = () => {
    if (nickname.trim()) {
      setIsCreating(true);
      createRoom(nickname);
      setTimeout(() => {
        router.push(`/room`);
      }, 500);
    }
  };

  const handleJoinRoom = () => {
    if (nickname.trim() && roomCode.trim()) {
      joinRoom(roomCode.toUpperCase(), nickname);
      setTimeout(() => {
        router.push(`/room`);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="absolute top-4 right-4 flex gap-3">
        <Link
          href="/how-to-play"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{t("home.howToPlay")}</span>
        </Link>
        <LanguageSelector />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{t("home.title")}</h1>
          <p className="text-slate-300">{t("home.subtitle")}</p>
          {!isConnected && (
            <p className="text-yellow-400 mt-2">{t("home.connecting")}</p>
          )}
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("home.nickname")}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("home.nicknamePlaceholder")}
              disabled={!isConnected}
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected || !nickname.trim() || isCreating}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t("home.createRoom")}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("home.or")}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("home.roomCode")}
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                placeholder={t("home.roomCodePlaceholder")}
                maxLength={6}
                disabled={!isConnected}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={!isConnected || !nickname.trim() || !roomCode.trim()}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t("home.joinRoom")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

