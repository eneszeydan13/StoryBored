'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '@/lib/i18n/context';
import { X, Copy, Check, QrCode, Smartphone, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  boardTitle: string;
}

export function ShareModal({
  isOpen,
  onClose,
  inviteCode,
  boardTitle,
}: ShareModalProps) {
  const { t } = useI18n();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.pathname.startsWith('/StoryBored') ? '/StoryBored' : '';
      setShareUrl(`${window.location.origin}${base}/join?code=${inviteCode}`);
    }
  }, [inviteCode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t('share_board')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[240px]">
                {boardTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: QR Code and Share Link */}
        <div className="py-5 flex flex-col items-center gap-5">
          {/* QR Code Container */}
          <div className="p-4 rounded-2xl bg-white shadow-md border border-stone-200 flex flex-col items-center gap-2">
            {shareUrl && (
              <QRCodeSVG
                value={shareUrl}
                size={180}
                level="M"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
              />
            )}
            <div className="flex items-center gap-1.5 text-stone-600 text-[11px] font-semibold mt-1">
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('scan_qr')}</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 text-center max-w-xs leading-relaxed">
            {t('scan_qr_desc')}
          </p>

          {/* Copy Link Field */}
          <div className="w-full space-y-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              {t('copy_link')}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200 select-all focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5] text-stone-900" />
                    <span>{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{t('copy_btn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Invite Code */}
          <div className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                {t('board_code')}
              </div>
              <div className="font-mono text-sm font-extrabold text-stone-900 dark:text-stone-100">
                {inviteCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title={t('copy_btn')}
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
