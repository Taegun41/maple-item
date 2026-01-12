// src/components/AdminMaterialManager.tsx
import React, { useState } from 'react';
import { supabase } from '@/utils/mapleUtils';
import { RefreshCw, Upload, Trash2 } from 'lucide-react';

interface Material {
  name: string;
  imageUrl: string;
  price: number;
}

interface Props {
  materials: Material[];
  onUpdate: (updatedMaterials: Material[]) => void; // 상태 업데이트용 함수
}

export default function AdminMaterialManager({ materials, onUpdate }: Props) {
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleImageUpdate = async (name: string, file: File) => {
    try {
      setIsUploading(name);
      const fileExt = file.name.split('.').pop();
      const fileName = `mat_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`; // 폴더를 최초 등록과 같은 uploads로 통일

      const { error: uploadError } = await supabase.storage
        .from('maple-storage')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('maple-storage')
        .getPublicUrl(filePath);

      // DB를 직접 수정하는 대신, 부모의 tempMaterials 상태만 업데이트합니다.
      const nextMaterials = materials.map(m => 
        m.name === name ? { ...m, imageUrl: data.publicUrl } : m
      );
      
      onUpdate(nextMaterials);
      alert('이미지가 임시 반영되었습니다. 하단의 동기화 버튼을 눌러야 최종 저장됩니다.');
    } catch (error: any) {
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setIsUploading(null);
    }
  };

  const handleDelete = (name: string) => {
    if (!confirm(`'${name}' 재료를 대기 목록에서 삭제하시겠습니까?`)) return;
    const nextMaterials = materials.filter(m => m.name !== name);
    onUpdate(nextMaterials);
  };

  return (
    <div className="mt-12 bg-white p-8 rounded-3xl border shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-black text-slate-800">재료 마스터 관리</h2>
        <p className="text-xs text-slate-400 mt-1">이곳에서 수정 후 하단의 [Supabase DB에 동기화]를 눌러주세요.</p>
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