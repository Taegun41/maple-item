// src/components/AdminForm.tsx
import React, { useState, useEffect } from 'react';
import { CraftItem, Ingredient, supabase } from '@/utils/mapleUtils';

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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setItem({ ...editingItem });
    } else {
      setItem({ name: '', price: 0, imageUrl: '', outputQuantity: 1, ingredients: [] });
    }
  }, [editingItem]);

  // 공통 이미지 업로드 로직
  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('maple-storage') // 미리 생성한 버킷 이름
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('maple-storage')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
      console.error(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0]);
      if (url) setItem({ ...item, imageUrl: url });
    }
  };

  const handleIngredientImageChange = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadImage(e.target.files[0]);
      if (url) {
        const next = [...item.ingredients];
        next[idx].imageUrl = url;
        setItem({ ...item, ingredients: next });
      }
    }
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = { imageUrl: '', name: '', quantity: 1 };
    setItem({ ...item, ingredients: [...item.ingredients, newIngredient] });
  };

  const handleAction = () => {
    if (!item.name) return alert('아이템 이름을 입력하세요.');
    if (isUploading) return alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
    
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
      
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 block">제품 이미지 업로드</label>
        <div className="flex gap-2 items-center">
          <input type="file" accept="image/*" onChange={handleMainImageChange} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {item.imageUrl && <img src={item.imageUrl} alt="preview" className="w-8 h-8 object-contain border rounded" />}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">제작 수량:</label>
        <input type="number" className="p-2 border rounded w-20 text-sm" value={item.outputQuantity} onChange={e => setItem({...item, outputQuantity: Number(e.target.value)})} />
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-slate-600">재료 정보 (직접 업로드)</span>
          <button onClick={addIngredient} className="text-[10px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors">재료 추가</button>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {item.ingredients.map((ing, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={(e) => handleIngredientImageChange(idx, e)} className="text-[8px] flex-1" />
                {ing.imageUrl && <img src={ing.imageUrl} alt="ing-preview" className="w-6 h-6 object-contain" />}
              </div>
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
            <button onClick={handleAction} disabled={isUploading} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm disabled:bg-slate-300">수정 확정</button>
          </>
        ) : (
          <button onClick={handleAction} disabled={isUploading} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm disabled:bg-slate-300">임시 저장 리스트 추가</button>
        )}
      </div>
    </div>
  );
}