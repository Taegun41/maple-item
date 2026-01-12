'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/mapleUtils';
import UserMaterialList from './UserMaterialList';
import UserDashboard from './UserDashboard';
import { RefreshCw, Save } from 'lucide-react';

export default function UserMode() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [materialPrices, setMaterialPrices] = useState<{ [key: string]: number }>({});
  const [productPrices, setProductPrices] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  // DB에서 데이터 가져오기 (소용돌이 버튼)
  const fetchData = async () => {
    setLoading(true);
    const { data: matData } = await supabase.from('maple_materials').select('*');
    const { data: itemData } = await supabase.from('maple_items').select('*');

    if (matData) {
      const formattedMats = matData.map(m => ({
        name: m.name,
        imageUrl: m.image_url,
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
        imageUrl: i.image_url,
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

  // 현재 입력된 가격들을 DB에 저장 (확인 버튼)
  const handleSave = async () => {
    if (!confirm('현재 시세를 저장하시겠습니까?')) return;
    setLoading(true);
    
    try {
      // 1. 재료 업데이트 (값이 유효한 경우만)
      const matUpdates = Object.entries(materialPrices)
        .filter(([name]) => name && name !== 'undefined') // 유효하지 않은 이름 제외
        .map(([name, price]) => 
          supabase.from('maple_materials').update({ price }).eq('name', name)
        );

      // 2. 아이템 업데이트
      const itemUpdates = Object.entries(productPrices)
        .filter(([id]) => id && id !== 'undefined')
        .map(([id, price]) => 
          supabase.from('maple_items').update({ price }).eq('id', id)
        );

      const results = await Promise.all([...matUpdates, ...itemUpdates]);
      
      // 에러 상세 로그 출력
      results.forEach((res, i) => {
        if (res.error) console.error(`에러 발생(${i}):`, res.error.message);
      });

      if (results.some(r => r.error)) {
        alert('저장 중 일부 오류가 발생했습니다. 콘솔을 확인하세요.');
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