'use client';

import React, { useState } from 'react';
import { CraftItem, Database, supabase } from '@/utils/mapleUtils';
import AdminMaterialManager from '@/components/AdminMaterialManager'; // 추가
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
    // 1. 아이템 목록 업데이트
    if (editingItem) {
      setTempItems(tempItems.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      setTempItems([...tempItems, newItem]);
    }
    
    // 2. 재료 목록 업데이트 (이미지 주소 동기화 및 필수 price 값 0으로 설정)
    const newMats = [...tempMaterials];
    newItem.ingredients.forEach(ing => {
      const existing = newMats.find(m => m.name === ing.name);
      if (!existing) {
        newMats.push({ name: ing.name, imageUrl: ing.imageUrl, price: 0 });
      } else {
        existing.imageUrl = ing.imageUrl;
      }
    });
    setTempMaterials(newMats);
    setEditingItem(null);
  };

  const handleFinalSave = async () => {
    // 1. 아이템 데이터 업로드
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

    // 2. 재료 데이터 업로드 (price 필드 포함)
    const { error: matError } = await supabase
      .from('maple_materials')
      .upsert(tempMaterials.map(mat => ({
        name: mat.name,
        image_url: mat.imageUrl,
        price: mat.price || 0 
      })));

    // 3. 결과 처리
    if (itemError || matError) {
      alert('데이터베이스 저장 중 오류가 발생했습니다.');
      console.error('Item Error:', itemError);
      console.error('Material Error:', matError);
    } else {
      alert('Supabase 클라우드 DB에 성공적으로 저장되었습니다.');
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
            <h2 className="text-lg font-black mb-6">DB 업로드 대기 목록</h2>
            {/* 기존 아이템 목록 표시 로직 */}
          </div>
          
          {/* 이 버튼이 클릭되면 아이템과 재료(수정된 이미지 포함)가 한꺼번에 DB로 갑니다 */}
          <button onClick={handleFinalSave} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl">
            Supabase DB에 동기화
          </button>
        </div>
      </div>

      {/* 재료 관리자에게 tempMaterials와 이를 수정할 수 있는 setTempMaterials를 넘깁니다 */}
      <AdminMaterialManager 
        materials={tempMaterials} 
        onUpdate={(updated) => setTempMaterials(updated)} 
      />
    </div>
  );
}