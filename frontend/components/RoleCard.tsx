"use client";

import { useState, useEffect } from "react";
import { Role } from "@/types/game";
import { useLanguage } from "@/context/LanguageContext";
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
  const { t } = useLanguage();

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
  const roleName = role ? t(`roles.${role}`) : t("common.loading");
  const roleDescription = role ? t(`roleDescriptions.${role}`) : "";

  return (
    <div className="perspective-1000 w-full max-w-xs mx-auto px-4 sm:px-0">
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
          className="absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl p-4 sm:p-6 flex flex-col items-center justify-center border-2 sm:border-4 border-slate-600"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-slate-600 flex items-center justify-center mb-2 sm:mb-4">
            <div className="text-5xl sm:text-8xl">🎴</div>
          </div>
          <p className="text-white text-lg sm:text-xl font-bold mb-1 sm:mb-2">{t("card.roleCard")}</p>
          <p className="text-slate-300 text-xs sm:text-sm text-center">
            {!isRevealed && role ? t("card.tapToReveal") : ""}
          </p>
        </div>

        {/* Card Front */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${roleColor} shadow-2xl p-4 sm:p-6 flex flex-col items-center justify-center border-2 sm:border-4 border-white/20`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white/20 flex items-center justify-center mb-2 sm:mb-4 backdrop-blur-sm">
            <RoleIcon className="w-12 h-12 sm:w-20 sm:h-20 text-white drop-shadow-lg" strokeWidth={1.5} />
          </div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
            {roleName}
          </h2>
          <div className="mt-2 sm:mt-4 text-white/80 text-xs sm:text-sm text-center max-w-xs px-2">
            {roleDescription}
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
