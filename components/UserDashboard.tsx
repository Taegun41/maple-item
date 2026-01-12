// src/components/UserDashboard.tsx
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

export default function UserDashboard({ 
  items, 
  materialPrices, 
  productPrices, 
  onProductPriceChange, 
  onDeleteItem 
}: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">제작 수익 실시간 분석</h2>
        <p className="text-[10px] text-slate-400 font-bold">수수료 5% 기준 (만 단위 계산)</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => {
          const currentPrice = productPrices[item.id] || 0;
          const { profit, roi } = calculateAnalysis(item, materialPrices, currentPrice);
          
          return (
            <div key={item.id} className="group bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between hover:shadow-lg transition-all">
              <div className="flex items-center gap-5 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <img src={item.imageUrl || '/api/placeholder/48/48'} className="max-w-[80%] max-h-[80%] object-contain" alt="" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">{item.name}</h3>
                  <div className="mt-2">
                    <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Current Market Price</label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        className="w-24 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-blue-600 outline-none focus:border-blue-400 focus:bg-white"
                        value={currentPrice || ''}
                        onChange={(e) => onProductPriceChange(item.id, e.target.value)}
                      />
                      <span className="text-[10px] text-slate-400 font-bold">만</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 px-8 border-x border-slate-50">
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Estimated Profit</p>
                  <p className={`text-lg font-black ${profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {Math.floor(profit).toLocaleString()}만
                  </p>
                </div>
                <div className="w-20 text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">ROI</p>
                  <p className={`text-2xl font-black ${roi > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {roi.toFixed(1)}%
                  </p>
                </div>
              </div>

              <button 
                onClick={() => onDeleteItem(item.id)}
                className="ml-4 p-2 text-slate-200 hover:text-red-500 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}