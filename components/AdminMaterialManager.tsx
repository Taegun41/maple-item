// src/components/AdminMaterialManager.tsx
import React, { useState } from 'react';
import { supabase } from '@/utils/mapleUtils';
import { RefreshCw, Upload, Save, Trash2 } from 'lucide-react';

interface Material {
  name: string;
  imageUrl: string;
  price: number;
}

interface Props {
  materials: Material[];
  onRefresh: () => void;
}

export default function AdminMaterialManager({ materials, onRefresh }: Props) {
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // 이미지 업로드 로직 (기존과 동일)
  const handleImageUpdate = async (name: string, file: File) => {
    try {
      setIsUploading(name);
      const fileExt = file.name.split('.').pop();
      const fileName = `mat_${Date.now()}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('maple-storage')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('maple-storage')
        .getPublicUrl(filePath);

      // DB 즉시 업데이트
      const { error: dbError } = await supabase
        .from('maple_materials')
        .update({ image_url: data.publicUrl })
        .eq('name', name);

      if (dbError) throw dbError;
      
      onRefresh(); // 부모 데이터 새로고침
    } catch (error: any) {
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setIsUploading(null);
    }
  };

  // 재료 삭제 로직
  const handleDelete = async (name: string) => {
    if (!confirm(`'${name}' 재료를 완전히 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('maple_materials').delete().eq('name', name);
    if (error) alert('삭제 실패');
    else onRefresh();
  };

  return (
    <div className="mt-12 bg-white p-8 rounded-3xl border shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800">재료 마스터 관리</h2>
          <p className="text-xs text-slate-400 mt-1">등록된 모든 재료의 이름과 이미지를 관리합니다.</p>
        </div>
        <button onClick={onRefresh} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((mat) => (
          <div key={mat.name} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
            <div className="relative w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
              <img src={mat.imageUrl} alt="" className="w-8 h-8 object-contain" />
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Upload className="w-4 h-4 text-white" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpdate(mat.name, e.target.files[0])}
                  disabled={isUploading === mat.name}
                />
              </label>
              {isUploading === mat.name && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700">{mat.name}</p>
              <p className="text-[10px] text-slate-400">현재 시세: {mat.price}만</p>
            </div>

            <button 
              onClick={() => handleDelete(mat.name)}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}