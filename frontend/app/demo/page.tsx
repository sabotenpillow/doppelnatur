"use client";

import { useState } from "react";
import RoleCard from "@/components/RoleCard";
import { Role } from "@/types/game";

const ALL_ROLES: Role[] = [
  "werewolf",
  "villager",
  "seer",
  "medium",
  "knight",
  "madman",
  "fox",
  "twins",
];

export default function RoleCardsDemo() {
  const [selectedRole, setSelectedRole] = useState<Role>("werewolf");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">役職カード デモ</h1>
          <p className="text-slate-300">各役職のカードをプレビューできます</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">役職を選択</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedRole === role
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {getRoleName(role)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="max-w-md mx-auto">
            <RoleCard role={selectedRole} autoReveal={false} />
            <p className="text-center text-gray-600 mt-4">
              カードをクリックしてフリップアニメーションを確認
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}

function getRoleName(role: Role): string {
  const names: Record<Role, string> = {
    werewolf: "人狼",
    villager: "村人",
    seer: "占い師",
    medium: "霊媒師",
    knight: "騎士",
    madman: "狂人",
    fox: "狐",
    twins: "双子",
  };
  return names[role];
}
