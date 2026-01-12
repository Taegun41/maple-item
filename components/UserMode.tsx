// src/components/UserMode.tsx
'use client';

import React, { useState } from 'react';
import { CraftItem, Database, calculateAnalysis } from '@/utils/mapleUtils';

interface Props {
  data: Database;
  onDeleteItem: (id: string) => void;
  onDeleteMaterial: (name: string) => void;
}

export default function UserMode({ data, onDeleteItem, onDeleteMaterial }: Props) {
  const [materialPrices, setMaterialPrices] = useState<{ [key: string]: number }>({});
  const [productPrices, setProductPrices] = useState<{ [key: string]: number }>({});

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      {/* 좌측: 재료 시세 입력창 */}
      <div className="col-span-4 bg-white rounded-3xl border shadow-sm sticky top-24 overflow-hidden">
        <div className="p-5 bg-slate-50 border-b">
          <h2 className="text-sm font-black text-slate-700">재료 시세 입력 (만)</h2>
        </div>
        <div className="p-4 space-y-2">
          {data.materials.map(mat => (
            <div key={mat.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border group">
              <img src={mat.imageUrl} className="w-8 h-8 object-contain" alt="" />
              <span className="text-xs font-bold text-slate-600 flex-1">{mat.name}</span>
              <input 
                type="number" 
                className="w-16 p-1.5 text-right border rounded-lg text-xs font-bold outline-none"
                onChange={e => setMaterialPrices({...materialPrices, [mat.name]: Number(e.target.value)})}
              />
              <button onClick={() => onDeleteMaterial(mat.name)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500">×</button>
            </div>
          ))}
        </div>
      </div>

      {/* 우측: 제작 분석 대시보드 */}
      <div className="col-span-8 space-y-3">
        {data.items.map(item => {
          const userPrice = productPrices[item.id] || item.price;
          const { profit, roi } = calculateAnalysis(item, materialPrices, userPrice);

          return (
            <div key={item.id} className="bg-white p-5 rounded-3xl border flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-5 flex-1">
                <img src={item.imageUrl} className="w-12 h-12 object-contain" alt="" />
                <div>
                  <h3 className="text-sm font-black text-slate-800">{item.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <input 
                      type="number" 
                      className="w-20 p-1 border rounded text-xs font-bold text-blue-600 outline-none"
                      defaultValue={item.price}
                      onChange={e => setProductPrices({...productPrices, [item.id]: Number(e.target.value)})}
                    />
                    <span className="text-[10px] text-slate-400">만</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 px-8 border-x">
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Profit</p>
                  <p className={`text-lg font-black ${profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {Math.floor(profit).toLocaleString()}만
                  </p>
                </div>
                <div className="w-20 text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">ROI</p>
                  <p className={`text-2xl font-black ${roi > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {roi.toFixed(1)}%
                  </p>
                </div>
              </div>
              <button onClick={() => onDeleteItem(item.id)} className="ml-4 text-slate-200 hover:text-red-500 text-2xl">×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}