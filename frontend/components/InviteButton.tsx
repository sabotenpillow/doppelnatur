"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Share2, Link2, Mail, MessageCircle, Check } from "lucide-react";

interface InviteButtonProps {
  roomCode: string;
}

export default function InviteButton({ roomCode }: InviteButtonProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate invite URL (assumes the app is at root path)
  const inviteUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/?room=${roomCode}`
    : "";

  const inviteMessage = t("room.inviteMessage");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShareViaLine = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
      `${inviteMessage}\n${inviteUrl}`
    )}`;
    window.open(lineUrl, "_blank");
    setIsOpen(false);
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(t("home.title") + " - " + t("room.inviteTitle"));
    const body = encodeURIComponent(
      `${inviteMessage}\n\n${t("room.roomCode")}: ${roomCode}\n${inviteUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        aria-label={t("room.invite")}
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base font-medium">{t("room.invite")}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-20 overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base mb-2">
                {t("room.inviteTitle")}
              </h3>
              <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                <code className="text-xs font-mono text-gray-700 flex-1 truncate">
                  {inviteUrl}
                </code>
              </div>
            </div>

            <div className="p-2">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {t("room.linkCopied")}
                    </span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      {t("room.copyLink")}
                    </span>
                  </>
                )}
              </button>

              {/* Share via LINE */}
              <button
                onClick={handleShareViaLine}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {t("room.shareViaLine")}
                </span>
              </button>

              {/* Share via Email */}
              <button
                onClick={handleShareViaEmail}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {t("room.shareViaEmail")}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
