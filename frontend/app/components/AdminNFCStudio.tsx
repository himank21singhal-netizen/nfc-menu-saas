'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdminNFCStudioProps {
  tableCount: number;
  setTableCount: (count: number) => void;
  onGenerateTableLinks: () => void;
  tableUrls: any[];
}

export default function AdminNFCStudio({
  tableCount,
  setTableCount,
  onGenerateTableLinks,
  tableUrls,
}: AdminNFCStudioProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
      <h2 className="text-xs font-black text-slate-100 uppercase tracking-wider">NFC & Table QR Studio</h2>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={tableCount}
          onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs w-24"
        />
        <button onClick={onGenerateTableLinks} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs">
          Generate Links
        </button>
      </div>

      <div className="space-y-2 pt-2">
        {tableUrls.map((tbl) => (
          <div key={tbl.tableNo} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-400">Table #{tbl.tableNo}</span>
            <a href={tbl.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono text-[11px]">
              {tbl.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}