"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { useState } from "react";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "ja" as const, name: "日本語", flag: "🇯🇵" },
    { code: "en-US" as const, name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB" as const, name: "English (UK)", flag: "🇬🇧" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 hover:text-gray-900"
        aria-label={t("settings.selectLanguage")}
      >
        <Globe className="w-5 h-5" />
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage?.name}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  locale === lang.code ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span
                  className={`font-medium ${
                    locale === lang.code ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {lang.name}
                </span>
                {locale === lang.code && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
