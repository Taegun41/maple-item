'use client';

import React, { useState, useEffect } from 'react';
import { supabase, Database } from '@/utils/mapleUtils'; // Database 타입 가져오기
import UserMaterialList from './UserMaterialList';
import UserDashboard from './UserDashboard';
import { RefreshCw, Save } from 'lucide-react';

export default function UserMode() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [materialPrices, setMaterialPrices] = useState<{ [key: string]: number }>({});
  const [productPrices, setProductPrices] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  // 기본 이미지 설정 (이미지가 없을 때 보여줄 대체 이미지)
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/50?text=No+Img';

  const fetchData = async () => {
    setLoading(true);
    const { data: matData } = await supabase.from('maple_materials').select('*');
    const { data: itemData } = await supabase.from('maple_items').select('*');

    if (matData) {
      const formattedMats = matData.map(m => ({
        name: m.name,
        // 주소가 'EMPTY'이거나 비어있으면 플레이스홀더를 보여줌
        imageUrl: (m.image_url && m.image_url !== 'EMPTY') ? m.image_url : PLACEHOLDER_IMAGE,
        price: m.price || 0
      }));
      setMaterials(formattedMats);
      
      const mPrices: { [key: string]: number } = {};
      formattedMats.forEach(m => mPrices[m.name] = m.price);
      setMaterialPrices(mPrices);
    }

    if (itemData) {
      const formattedItems = itemData.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        imageUrl: (i.image_url && i.image_url !== 'EMPTY') ? i.image_url : PLACEHOLDER_IMAGE,
        outputQuantity: i.output_quantity,
        ingredients: i.ingredients
      }));
      setItems(formattedItems);
      
      const iPrices: { [key: string]: number } = {};
      formattedItems.forEach(i => iPrices[i.id] = i.price);
      setProductPrices(iPrices);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ... handleSave 함수는 기존과 동일하게 유지 (가격을 업데이트하는 로직이므로 영향 없음)
  const handleSave = async () => {
    if (!confirm('현재 시세를 저장하시겠습니까?')) return;
    setLoading(true);
    
    try {
      const matUpdates = Object.entries(materialPrices)
        .filter(([name]) => name && name !== 'undefined')
        .map(([name, price]) => 
          supabase.from('maple_materials').update({ price }).eq('name', name)
        );

      const itemUpdates = Object.entries(productPrices)
        .filter(([id]) => id && id !== 'undefined')
        .map(([id, price]) => 
          supabase.from('maple_items').update({ price }).eq('id', id)
        );

      const results = await Promise.all([...matUpdates, ...itemUpdates]);
      
      if (results.some(r => r.error)) {
        alert('저장 중 일부 오류가 발생했습니다.');
      } else {
        alert('성공적으로 저장되었습니다!');
      }
    } catch (e) {
      console.error('예기치 못한 에러:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-3xl shadow-xl">
        <h1 className="text-white font-black px-4 tracking-tighter italic">MAPLE PRICE DASHBOARD</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">최신 데이터 불러오기</span>
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center gap-2 px-6 transition-all shadow-lg shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs font-bold">시세 정보 저장</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-4">
          <UserMaterialList 
            materials={materials}
            prices={materialPrices}
            onPriceChange={(name, val) => setMaterialPrices(prev => ({...prev, [name]: Number(val)}))}
            onDeleteMaterial={() => {}} 
          />
        </div>
        <div className="col-span-8">
          <UserDashboard 
            items={items}
            materialPrices={materialPrices}
            productPrices={productPrices}
            onProductPriceChange={(id, val) => setProductPrices(prev => ({...prev, [id]: Number(val)}))}
            onDeleteItem={() => {}}
          />
        </div>
      </div>
    </div>
  );
}