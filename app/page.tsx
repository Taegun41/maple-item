'use client';

import React, { useState, useEffect } from 'react';
import AdminMode from '@/components/AdminMode';
import UserMode from '@/components/UserMode';
import { Database, supabase } from '@/utils/mapleUtils';

export default function MapleApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [dbData, setDbData] = useState<Database>({ items: [], materials: [] });

  const loadData = async () => {
    const { data: items } = await supabase.from('maple_items').select('*');
    const { data: materials } = await supabase.from('maple_materials').select('*');

    setDbData({
      items: (items || []).map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        imageUrl: i.image_url,
        outputQuantity: i.output_quantity,
        ingredients: i.ingredients
      })),
      materials: (materials || []).map(m => ({
        name: m.name,
        imageUrl: m.image_url
      }))
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <header className="max-w-[1400px] mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">MAPLE CRAFT DASHBOARD</h1>
        <button onClick={() => setIsAdmin(!isAdmin)} className="px-5 py-2 bg-white border rounded-xl text-xs font-bold shadow-sm">
          {isAdmin ? '분석 모드' : 'DB 설정'}
        </button>
      </header>

      <main className="max-w-[1400px] mx-auto">
        {isAdmin ? (
          <AdminMode initialData={dbData} onComplete={loadData} />
        ) : (
          <UserMode 
            data={dbData} 
            onDeleteItem={async (id) => {
              if (confirm('삭제하시겠습니까?')) {
                await supabase.from('maple_items').delete().eq('id', id);
                loadData();
              }
            }}
            onDeleteMaterial={async (name) => {
              if (confirm('재료를 시세창에서 삭제하시겠습니까?')) {
                await supabase.from('maple_materials').delete().eq('name', name);
                loadData();
              }
            }}
          />
        )}
      </main>
    </div>
  );
}