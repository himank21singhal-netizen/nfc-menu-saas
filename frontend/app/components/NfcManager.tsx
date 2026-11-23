'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, Copy, Check } from 'lucide-react';

interface NfcManagerProps {
  slug: string;
  secretKey: string;
}

export default function NfcManager({ slug, secretKey }: NfcManagerProps) {
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [baseDomain, setBaseDomain] = useState<string>('');
  const [signedUrl, setSignedUrl] = useState<string>('');

  useEffect(() => {
    setBaseDomain(window.location.origin);
  }, []);

  // Web Crypto API HMAC-SHA256 signature generator
  async function generateSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  useEffect(() => {
    async function updateUrl() {
      if (!slug || !secretKey || !baseDomain) return;
      const payload = `${slug}:${tableNumber}`;
      const sig = await generateSignature(payload, secretKey);
      const url = `${baseDomain}/m/${slug}?tbl=${tableNumber}&sig=${sig}`;
      setSignedUrl(url);
    }
    updateUrl();
  }, [slug, secretKey, tableNumber, baseDomain]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(signedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">NFC & QR Tag Studio</h2>
            <p className="text-xs text-slate-400">Generate secure URLs for physical table encoding</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> HMAC Protected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Table Number</label>
            <input
              type="number"
              min="1"
              max="100"
              value={tableNumber}
              onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Generated Signed Target URL</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
              <input
                type="text"
                readOnly
                value={signedUrl}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none truncate px-2 font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-all shrink-0"
                title="Copy URL for NFC Writer app"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Copy this URL into any NFC writing application to program physical NFC tags for <strong>Table #{tableNumber}</strong>.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="p-4 bg-white rounded-xl shadow-xl">
            {signedUrl ? (
              <QRCodeSVG value={signedUrl} size={140} level="H" />
            ) : (
              <div className="w-[140px] h-[140px] bg-slate-200 animate-pulse rounded" />
            )}
          </div>
          <span className="text-xs font-bold text-slate-300">Table #{tableNumber} Standee Code</span>
        </div>
      </div>
    </div>
  );
}