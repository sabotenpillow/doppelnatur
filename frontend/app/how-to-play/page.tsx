"use client";

import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { BookOpen, Users, Moon, Sun, Trophy, Lightbulb, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HowToPlayPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{t("howToPlay.backToHome")}</span>
          </Link>
          <LanguageSelector />
        </div>

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            {t("howToPlay.title")}
          </h1>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-600" />
            {t("howToPlay.overview.title")}
          </h2>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            {t("howToPlay.overview.description")}
          </p>
        </div>

        {/* Game Flow */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Sun className="w-6 h-6 text-yellow-600" />
            {t("howToPlay.gameFlow.title")}
          </h2>
          <div className="space-y-4">
            {["step1", "step2", "step3", "step4", "step5"].map((step, index) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">
                    {t(`howToPlay.gameFlow.${step}`)}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {t(`howToPlay.gameFlow.${step}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            {t("howToPlay.teams.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-800 text-base sm:text-lg mb-2">
                {t("howToPlay.teams.villagers")}
              </h3>
              <p className="text-green-700 text-sm sm:text-base">
                {t("howToPlay.teams.villagersDesc")}
              </p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <h3 className="font-bold text-red-800 text-base sm:text-lg mb-2">
                {t("howToPlay.teams.werewolves")}
              </h3>
              <p className="text-red-700 text-sm sm:text-base">
                {t("howToPlay.teams.werwolvesDesc")}
              </p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <h3 className="font-bold text-orange-800 text-base sm:text-lg mb-2">
                {t("howToPlay.teams.fox")}
              </h3>
              <p className="text-orange-700 text-sm sm:text-base">
                {t("howToPlay.teams.foxDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Moon className="w-6 h-6 text-indigo-600" />
            {t("howToPlay.roles.title")}
          </h2>
          <div className="space-y-4">
            {["werewolf", "villager", "seer", "medium", "knight", "madman", "fox", "twins"].map((role) => (
              <div key={role} className="border-l-4 border-purple-400 pl-4 py-2">
                <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1">
                  {t(`howToPlay.roles.${role}`)}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {t(`howToPlay.roles.${role}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            {t("howToPlay.tips.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["tip1", "tip2", "tip3", "tip4"].map((tip) => (
              <div key={tip} className="bg-yellow-50 rounded-xl p-4">
                <h3 className="font-bold text-yellow-900 text-base mb-2 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {t(`howToPlay.tips.${tip}`)}
                </h3>
                <p className="text-yellow-800 text-sm">
                  {t(`howToPlay.tips.${tip}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("howToPlay.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
