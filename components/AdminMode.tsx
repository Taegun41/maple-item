// src/components/AdminMode.tsx

import React, { useState, useEffect } from 'react';
import { CraftItem, Database, supabase } from '@/utils/mapleUtils';
import AdminForm from './AdminForm';
import AdminMaterialManager from './AdminMaterialManager';

interface Props {
  initialData: Database;
  onComplete: () => void;
}

export default function AdminMode({ initialData, onComplete }: Props) {
  // 1. 초기 상태를 DB에서 가져온 데이터로 설정합니다.
  const [tempItems, setTempItems] = useState<CraftItem[]>(initialData.items);
  const [tempMaterials, setTempMaterials] = useState(initialData.materials);
  const [editingItem, setEditingItem] = useState<CraftItem | null>(null);

  // DB 데이터가 외부에서 변경될 경우(예: 새로고침)를 대비해 상태를 동기화합니다.
  useEffect(() => {
    setTempItems(initialData.items);
    setTempMaterials(initialData.materials);
  }, [initialData]);

  const handleSaveToWaitlist = (newItem: CraftItem) => {
    // 2. 수정 모드일 때와 신규 등록일 때를 구분하여 처리합니다.
    if (editingItem) {
      // 기존 아이템의 ID를 유지하면서 내용을 변경합니다.
      setTempItems(tempItems.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      // 완전히 새로운 아이템인 경우에만 목록에 추가합니다.
      setTempItems([...tempItems, newItem]);
    }
    
    // 재료 이미지 리셋 방지 로직 적용
    const newMats = [...tempMaterials];
    newItem.ingredients.forEach(ing => {
      const existingIdx = newMats.findIndex(m => m.name === ing.name);
      if (existingIdx === -1) {
        newMats.push({ name: ing.name, imageUrl: ing.imageUrl || '', price: 0 });
      } else {
        // 이미지가 새로 들어온 경우에만 업데이트하여 기존 데이터를 보존합니다.
        if (ing.imageUrl && ing.imageUrl !== '') {
          newMats[existingIdx] = { ...newMats[existingIdx], imageUrl: ing.imageUrl };
        }
      }
    });
    setTempMaterials(newMats);
    setEditingItem(null);
  };

  const handleFinalSave = async () => {
    // upsert를 사용하므로 ID가 같은 기존 데이터는 수정되고, 없는 데이터는 삽입됩니다.
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

    const { error: matError } = await supabase
      .from('maple_materials')
      .upsert(tempMaterials.map(mat => ({
        name: mat.name,
        image_url: mat.imageUrl,
        price: mat.price || 0
      })));

    if (itemError || matError) {
      alert('데이터베이스 저장 중 오류가 발생했습니다.');
    } else {
      alert('변경 사항이 성공적으로 DB에 반영되었습니다.');
      onComplete();
    }
  };

  return (
    <div className="space-y-8">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black">DB 업로드 대기 목록</h2>
              <span className="text-xs text-slate-400">총 {tempItems.length}개의 아이템</span>
            </div>
            
            <div className="space-y-2">
              {tempItems.map(item => (
                <div key={item.id} className="group relative p-4 bg-slate-50 border rounded-2xl flex justify-between items-center hover:bg-white hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl || 'https://placehold.co/50?text=No+Img'} className="w-8 h-8 object-contain" alt="" />
                    <div>
                      <span className="font-bold text-sm block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">ID: {item.id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingItem(item);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="px-3 py-1 bg-amber-500 text-white text-xs rounded-lg font-bold"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => setTempItems(tempItems.filter(i => i.id !== item.id))} 
                      className="px-3 py-1 bg-rose-500 text-white text-xs rounded-lg font-bold"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
              {tempItems.length === 0 && (
                <div className="text-center py-20 text-slate-300 text-sm italic">
                  대기 목록이 비어 있습니다.
                </div>
              )}
            </div>
          </div>
          <button onClick={handleFinalSave} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl hover:bg-blue-700 transition-colors">
            변경 사항을 DB에 최종 동기화
          </button>
        </div>
      </div>

      <AdminMaterialManager 
        materials={tempMaterials} 
        onUpdate={(updated) => setTempMaterials(updated)} 
      />
    </div>
  );
}