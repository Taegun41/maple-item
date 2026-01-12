'use client';

import React from 'react';

interface Props {
  materials: { name: string; imageUrl: string }[];
  prices: { [key: string]: number };
  onPriceChange: (name: string, value: string) => void;
  onDeleteMaterial: (name: string) => void;
}

export default function UserMaterialList({ materials, prices, onPriceChange, onDeleteMaterial }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
      <div className="p-5 bg-slate-50/50 border-b border-slate-100">
        <h2 className="text-sm font-black text-slate-700 tracking-tight">재료 시세 입력 (만)</h2>
      </div>
      <div className="p-4 space-y-2">
        {materials.map((mat) => (
          <div key={mat.name} className="flex items-center gap-3 p-3 bg-slate-50/30 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
            <img src={mat.imageUrl} className="w-8 h-8 object-contain" alt={mat.name} />
            <span className="text-xs font-bold text-slate-600 flex-1 truncate">{mat.name}</span>
            <input 
              type="number" 
              className="w-16 p-2 text-right bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400"
              value={prices[mat.name] || ''}
              onChange={(e) => onPriceChange(mat.name, e.target.value)}
            />
            <button 
              onClick={() => onDeleteMaterial(mat.name)}
              className="text-slate-200 hover:text-rose-500 text-xs px-1 opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}