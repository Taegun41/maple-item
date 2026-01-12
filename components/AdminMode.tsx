'use client';

import React, { useState, useEffect } from 'react';
import { CraftItem, Ingredient, Database, supabase } from '@/utils/mapleUtils';
import AdminForm from './AdminForm';

interface Props {
  initialData: Database;
  onComplete: () => void;
}

export default function AdminMode({ initialData, onComplete }: Props) {
  const [tempItems, setTempItems] = useState<CraftItem[]>(initialData.items);
  const [tempMaterials, setTempMaterials] = useState(initialData.materials);
  const [editingItem, setEditingItem] = useState<CraftItem | null>(null);

  const handleSaveToWaitlist = (newItem: CraftItem) => {
    if (editingItem) {
      setTempItems(tempItems.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      setTempItems([...tempItems, newItem]);
    }
    
    const newMats = [...tempMaterials];
    newItem.ingredients.forEach(ing => {
      if (!newMats.find(m => m.name === ing.name)) {
        newMats.push({ name: ing.name, imageUrl: ing.imageUrl });
      }
    });
    setTempMaterials(newMats);
    setEditingItem(null);
  };

  const handleFinalSave = async () => {
    // 1. 아이템 업로드
    const { error: itemError } = await supabase
      .from('maple_items')
      .upsert(tempItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.imageUrl,
        output_quantity: item.outputQuantity,
        ingredients: item.ingredients
      })));

    // 2. 재료 업로드
    const { error: matError } = await supabase
      .from('maple_materials')
      .upsert(tempMaterials.map(mat => ({
        name: mat.name,
        image_url: mat.imageUrl
      })));

    if (itemError || matError) {
      alert('데이터베이스 저장 중 오류가 발생했습니다.');
      console.error(itemError, matError);
    } else {
      alert('Supabase 클라우드 DB에 성공적으로 저장되었습니다.');
      onComplete();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-5 bg-white p-8 rounded-3xl border shadow-sm h-fit sticky top-24">
        <AdminForm 
          onSave={handleSaveToWaitlist} 
          editingItem={editingItem}
          onConfirmEdit={handleSaveToWaitlist}
          onCancelEdit={() => setEditingItem(null)}
        />
      </div>

      <div className="col-span-7 space-y-4">
        <div className="bg-white p-8 rounded-3xl border shadow-sm min-h-[400px]">
          <h2 className="text-lg font-black mb-6">DB 업로드 대기 목록</h2>
          <div className="space-y-2">
            {tempItems.map(item => (
              <div key={item.id} className="group relative p-4 bg-slate-50 border rounded-2xl flex justify-between items-center hover:bg-white hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <img src={item.imageUrl} className="w-8 h-8 object-contain" alt="" />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setEditingItem(item)} className="px-3 py-1 bg-amber-500 text-white text-xs rounded">수정</button>
                  <button onClick={() => setTempItems(tempItems.filter(i => i.id !== item.id))} className="px-3 py-1 bg-red-500 text-white text-xs rounded">삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleFinalSave} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl">Supabase DB에 동기화</button>
      </div>
    </div>
  );
}