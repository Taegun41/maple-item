'use client';

import React from 'react';

// 1. 재료 객체에 price 속성이 포함될 수 있도록 타입을 수정합니다.
interface MaterialItem {
  name: string;
  imageUrl: string;
  price?: number; 
}

interface Props {
  materials: MaterialItem[];
  prices: { [key: string]: number };
  onPriceChange: (name: string, value: string) => void;
  onDeleteMaterial: (name: string) => void;
}

export default function UserMaterialList({ materials, prices, onPriceChange, onDeleteMaterial }: Props) {
  // 이미지가 비어있을 때 사용할 기본 이미지
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/50?text=No+Img';

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
      <div className="p-5 bg-slate-50/50 border-b border-slate-100">
        <h2 className="text-sm font-black text-slate-700 tracking-tight">재료 시세 입력 (만)</h2>
      </div>
      <div className="p-4 space-y-2">
        {materials.map((mat) => {
          // 2. 이미지 주소가 'EMPTY'이거나 없는 경우 대체 이미지 사용
          const safeImageUrl = (mat.imageUrl && mat.imageUrl !== 'EMPTY') 
            ? mat.imageUrl 
            : PLACEHOLDER_IMAGE;

          return (
            <div key={mat.name} className="flex items-center gap-3 p-3 bg-slate-50/30 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
              <img 
                src={safeImageUrl} 
                className="w-8 h-8 object-contain" 
                alt={mat.name} 
              />
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
          );
        })}
      </div>
    </div>
  );
}