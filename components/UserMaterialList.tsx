// src/components/UserMaterialList.tsx
import React from 'react';

interface Props {
  materials: { name: string; imageUrl: string }[];
  prices: { [key: string]: number };
  onPriceChange: (name: string, value: string) => void;
  onDeleteMaterial: (name: string) => void;
}

export default function UserMaterialList({ materials, prices, onPriceChange, onDeleteMaterial }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 bg-slate-50 border-b border-slate-200">
        <h2 className="text-sm font-black text-slate-700 uppercase">재료 시세 입력</h2>
      </div>
      <div className="p-4 space-y-2">
        {materials.map((mat) => (
          <div key={mat.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
            <img src={mat.imageUrl || '/api/placeholder/32/32'} className="w-8 h-8 rounded-lg object-contain bg-white border" alt="" />
            <span className="text-xs font-bold text-slate-600 flex-1">{mat.name}</span>
            <input 
              type="number" 
              className="w-16 p-1.5 text-right bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
              value={prices[mat.name] || ''}
              onChange={(e) => onPriceChange(mat.name, e.target.value)}
            />
            <button 
              onClick={() => onDeleteMaterial(mat.name)}
              className="text-slate-300 hover:text-red-500 text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}