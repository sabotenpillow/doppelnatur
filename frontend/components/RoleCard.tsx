"use client";

import { useState, useEffect } from "react";
import { Role } from "@/types/game";
import {
  Wolf,
  User,
  Eye,
  Ghost,
  Shield,
  Smile,
  Sparkles,
  Users,
} from "lucide-react";

interface RoleCardProps {
  role?: Role;
  revealed?: boolean;
  autoReveal?: boolean;
}

const ROLE_ICONS: Record<Role, React.ComponentType<any>> = {
  werewolf: Wolf,
  villager: User,
  seer: Eye,
  medium: Ghost,
  knight: Shield,
  madman: Smile,
  fox: Sparkles,
  twins: Users,
};

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

const ROLE_COLORS: Record<Role, string> = {
  werewolf: "from-red-600 to-red-800",
  villager: "from-green-600 to-green-800",
  seer: "from-blue-600 to-blue-800",
  medium: "from-purple-600 to-purple-800",
  knight: "from-yellow-600 to-yellow-800",
  madman: "from-pink-600 to-pink-800",
  fox: "from-orange-600 to-orange-800",
  twins: "from-cyan-600 to-cyan-800",
};

export default function RoleCard({ role, revealed = false, autoReveal = false }: RoleCardProps) {
  const [isRevealed, setIsRevealed] = useState(revealed);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoReveal && role && !isRevealed) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setIsRevealed(true);
        }, 300);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoReveal, role, isRevealed]);

  const handleClick = () => {
    if (!isRevealed && role) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsRevealed(true);
      }, 300);
    }
  };

  const RoleIcon = role ? ROLE_ICONS[role] : User;
  const roleColor = role ? ROLE_COLORS[role] : "from-gray-600 to-gray-800";
  const roleName = role ? ROLE_NAMES[role] : "不明";

  return (
    <div className="perspective-1000 w-full max-w-xs mx-auto">
      <div
        className={`relative w-full aspect-[2/3] cursor-pointer transition-transform duration-700 transform-style-3d ${
          isAnimating ? "animate-flip" : ""
        } ${isRevealed ? "rotate-y-180" : ""}`}
        onClick={handleClick}
        style={{
          transformStyle: "preserve-3d",
          transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl p-6 flex flex-col items-center justify-center border-4 border-slate-600"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-32 h-32 rounded-full bg-slate-600 flex items-center justify-center mb-4">
            <div className="text-8xl">🎴</div>
          </div>
          <p className="text-white text-xl font-bold mb-2">役職カード</p>
          <p className="text-slate-300 text-sm text-center">
            {!isRevealed && role ? "タップして確認" : ""}
          </p>
        </div>

        {/* Card Front */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br ${roleColor} shadow-2xl p-6 flex flex-col items-center justify-center border-4 border-white/20`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
            <RoleIcon className="w-20 h-20 text-white drop-shadow-lg" strokeWidth={1.5} />
          </div>
          <h2 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">
            {roleName}
          </h2>
          <div className="mt-4 text-white/80 text-sm text-center max-w-xs">
            {role && getRoleDescription(role)}
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes flip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        .animate-flip {
          animation: flip 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    werewolf: "夜に1人を襲撃できる",
    villager: "特殊能力なし",
    seer: "夜に1人を占える",
    medium: "処刑された人を判定",
    knight: "1人を襲撃から守る",
    madman: "人狼陣営の村人",
    fox: "襲撃されても死なない",
    twins: "相方を知っている",
  };
  return descriptions[role];
}
