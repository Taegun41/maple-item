'use client';

import React from 'react';
import { CraftItem, calculateAnalysis } from '@/utils/mapleUtils';

interface Props {
  items: CraftItem[];
  materialPrices: { [key: string]: number };
  productPrices: { [key: string]: number };
  onProductPriceChange: (id: string, value: string) => void;
  onDeleteItem: (id: string) => void;
}

export default function UserDashboard({ items, materialPrices, productPrices, onDeleteItem, onProductPriceChange }: Props) {
  // 이미지가 없을 때 보여줄 기본 이미지
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/50?text=No+Img';

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const currentPrice = productPrices[item.id] || 0;
        
        // 데이터가 유효하지 않을 경우를 대비한 안전한 분석 계산
        const analysis = calculateAnalysis(item, materialPrices, currentPrice) || { profit: 0, roi: 0 };
        const { profit, roi } = analysis;
        
        // 이미지 예외 처리 로직
        const safeImageUrl = (item.imageUrl && item.imageUrl !== 'EMPTY') 
          ? item.imageUrl 
          : PLACEHOLDER_IMAGE;

        return (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-50">
                <img src={safeImageUrl} className="w-10 h-10 object-contain" alt={item.name} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">{item.name}</h3>
                <div className="mt-2 flex items-center gap-1">
                  <input 
                    type="number" 
                    className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-blue-600 outline-none"
                    value={currentPrice || ''}
                    onChange={(e) => onProductPriceChange(item.id, e.target.value)}
                  />
                  <span className="text-[10px] text-slate-400 font-bold">만 메소</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 px-10 border-x border-slate-50">
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-tighter">Net Profit</p>
                <p className={`text-xl font-black ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {Math.floor(profit).toLocaleString()}만
                </p>
              </div>
              <div className="w-20 text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-tighter">Return %</p>
                <p className={`text-2xl font-black ${roi > 0 ? 'text-emerald-500' : roi < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {roi.toFixed(1)}%
                </p>
              </div>
            </div>

            <button onClick={() => onDeleteItem(item.id)} className="ml-6 text-slate-200 hover:text-rose-500 transition-colors">
              <span className="text-2xl">×</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}