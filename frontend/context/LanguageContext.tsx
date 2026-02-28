"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ja from "@/locales/ja.json";
import enUS from "@/locales/en-US.json";
import enGB from "@/locales/en-GB.json";

type Locale = "ja" | "en-US" | "en-GB";

type Translations = typeof ja;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Translations> = {
  ja,
  "en-US": enUS,
  "en-GB": enGB,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ja");

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && translations[savedLocale]) {
      setLocaleState(savedLocale);
    } else if (savedLocale === "en") {
      // Migrate old "en" to "en-US" for backward compatibility
      setLocaleState("en-US");
      localStorage.setItem("locale", "en-US");
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== "string") {
      return key;
    }

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, param) => {
        return params[param]?.toString() || "";
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
