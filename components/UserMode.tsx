'use client';

import React, { useState, useEffect } from 'react';
import { supabase, Database } from '@/utils/mapleUtils';
import UserMaterialList from './UserMaterialList';
import UserDashboard from './UserDashboard';
import { RefreshCw, Save } from 'lucide-react';

// 1. Props 타입 정의: page.tsx에서 넘겨주는 데이터와 함수의 타입을 맞춥니다.
interface UserModeProps {
  data: Database;
  onDeleteItem: (id: string) => Promise<void>;
  onDeleteMaterial: (name: string) => Promise<void>;
}

export default function UserMode({ data, onDeleteItem, onDeleteMaterial }: UserModeProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [materialPrices, setMaterialPrices] = useState<{ [key: string]: number }>({});
  const [productPrices, setProductPrices] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  // 기본 이미지 설정
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/50?text=No+Img';

  // 2. 초기 데이터 로드: page.tsx에서 받은 dbData(data)를 기반으로 상태를 초기화합니다.
  useEffect(() => {
    if (data) {
      formatAndSetData(data.materials, data.items);
    }
  }, [data]);

  // 데이터 가공 및 상태 저장 로직 분리
  const formatAndSetData = (matData: any[], itemData: any[]) => {
    const formattedMats = (matData || []).map(m => ({
      name: m.name,
      imageUrl: (m.imageUrl && m.imageUrl !== 'EMPTY') ? m.imageUrl : PLACEHOLDER_IMAGE,
      price: m.price || 0
    }));
    setMaterials(formattedMats);

    const mPrices: { [key: string]: number } = {};
    formattedMats.forEach(m => mPrices[m.name] = m.price);
    setMaterialPrices(mPrices);

    const formattedItems = (itemData || []).map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      imageUrl: (i.imageUrl && i.imageUrl !== 'EMPTY') ? i.imageUrl : PLACEHOLDER_IMAGE,
      outputQuantity: i.outputQuantity,
      ingredients: i.ingredients
    }));
    setItems(formattedItems);

    const iPrices: { [key: string]: number } = {};
    formattedItems.forEach(i => iPrices[i.id] = i.price);
    setProductPrices(iPrices);
  };

  // 수동 새로고침 (소용돌이 버튼)
  const fetchData = async () => {
    setLoading(true);
    const { data: matData } = await supabase.from('maple_materials').select('*');
    const { data: itemData } = await supabase.from('maple_items').select('*');

    // DB 컬럼명(image_url 등)을 컴포넌트 내부에서 사용하는 이름(imageUrl)으로 매핑
    const mappedMats = (matData || []).map(m => ({
      name: m.name,
      imageUrl: m.image_url,
      price: m.price
    }));
    const mappedItems = (itemData || []).map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      imageUrl: i.image_url,
      outputQuantity: i.output_quantity,
      ingredients: i.ingredients
    }));

    formatAndSetData(mappedMats, mappedItems);
    setLoading(false);
  };

  // 시세 정보 DB 저장 (확인 버튼)
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
      {/* 상단 헤더 섹션 */}
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

      {/* 메인 대시보드 콘텐츠 */}
      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-4">
          <UserMaterialList 
            materials={materials}
            prices={materialPrices}
            onPriceChange={(name, val) => setMaterialPrices(prev => ({...prev, [name]: Number(val)}))}
            onDeleteMaterial={onDeleteMaterial} 
          />
        </div>
        <div className="col-span-8">
          <UserDashboard 
            items={items}
            materialPrices={materialPrices}
            productPrices={productPrices}
            onProductPriceChange={(id, val) => setProductPrices(prev => ({...prev, [id]: Number(val)}))}
            onDeleteItem={onDeleteItem}
          />
        </div>
      </div>
    </div>
  );
}