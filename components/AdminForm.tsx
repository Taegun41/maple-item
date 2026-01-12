// src/components/AdminForm.tsx
import React, { useState, useEffect } from 'react';
import { CraftItem, Ingredient } from '@/utils/mapleUtils';

interface Props {
  onSave: (item: CraftItem) => void;
  onConfirmEdit: (item: CraftItem) => void;
  onCancelEdit: () => void;
  editingItem: CraftItem | null;
}

export default function AdminForm({ onSave, onConfirmEdit, onCancelEdit, editingItem }: Props) {
  const [item, setItem] = useState<Omit<CraftItem, 'id'>>({
    name: '',
    price: 0,
    imageUrl: '',
    outputQuantity: 1,
    ingredients: [],
  });

  // 수정 버튼을 눌렀을 때 폼에 데이터 채우기
  useEffect(() => {
    if (editingItem) {
      setItem({ ...editingItem });
    } else {
      setItem({ name: '', price: 0, imageUrl: '', outputQuantity: 1, ingredients: [] });
    }
  }, [editingItem]);

  const addIngredient = () => {
    const newIngredient: Ingredient = { imageUrl: '', name: '', quantity: 1 };
    setItem({ ...item, ingredients: [...item.ingredients, newIngredient] });
  };

  const handleAction = () => {
    if (!item.name) return alert('아이템 이름을 입력하세요.');
    
    if (editingItem) {
      onConfirmEdit({ ...item, id: editingItem.id });
    } else {
      onSave({ ...item, id: Date.now().toString() });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-sm font-bold ${editingItem ? 'text-amber-600' : 'text-blue-600'}`}>
          {editingItem ? '[수정 모드]' : '[신규 등록 모드]'}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <input type="text" placeholder="아이템 이름" className="p-2 border rounded text-sm" value={item.name} onChange={e => setItem({...item, name: e.target.value})} />
        <input type="number" placeholder="가격 (만 단위)" className="p-2 border rounded text-sm" value={item.price || ''} onChange={e => setItem({...item, price: Number(e.target.value)})} />
      </div>
      
      <input type="text" placeholder="제품 이미지 URL" className="w-full p-2 border rounded text-sm" value={item.imageUrl} onChange={e => setItem({...item, imageUrl: e.target.value})} />
      
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">제작 수량:</label>
        <input type="number" className="p-2 border rounded w-20 text-sm" value={item.outputQuantity} onChange={e => setItem({...item, outputQuantity: Number(e.target.value)})} />
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-slate-600">재료 정보 (이미지 포함)</span>
          <button onClick={addIngredient} className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors">재료 추가</button>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {item.ingredients.map((ing, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <input type="text" placeholder="재료 이미지 URL" className="w-full p-1.5 border rounded text-[10px]" value={ing.imageUrl} onChange={e => {
                const next = [...item.ingredients]; next[idx].imageUrl = e.target.value; setItem({...item, ingredients: next});
              }} />
              <div className="flex gap-2">
                <input type="text" placeholder="재료명" className="flex-1 p-1.5 border rounded text-[10px]" value={ing.name} onChange={e => {
                  const next = [...item.ingredients]; next[idx].name = e.target.value; setItem({...item, ingredients: next});
                }} />
                <input type="number" placeholder="개수" className="w-14 p-1.5 border rounded text-[10px]" value={ing.quantity} onChange={e => {
                  const next = [...item.ingredients]; next[idx].quantity = Number(e.target.value); setItem({...item, ingredients: next});
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2 mt-6">
        {editingItem ? (
          <>
            <button onClick={onCancelEdit} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm">취소</button>
            <button onClick={handleAction} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm">수정 확정</button>
          </>
        ) : (
          <button onClick={handleAction} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm">임시 저장 리스트 추가</button>
        )}
      </div>
    </div>
  );
}