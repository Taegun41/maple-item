import { createClient } from '@supabase/supabase-js';

// 깃허브 세팅이나 .env.local 파일에 설정한 환경 변수를 불러옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 외부 파일에서 이 supabase 객체를 불러와 DB 조작을 수행하게 됩니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터 구조 정의 (타입스크립트 인터페이스)
export interface Ingredient {
  imageUrl: string;
  name: string;
  quantity: number;
}

export interface CraftItem {
  id: string;
  name: string;
  price: number; // 만 단위 (예: 1000 = 1000만 메소)
  imageUrl: string;
  outputQuantity: number;
  ingredients: Ingredient[];
}

export interface Database {
  items: CraftItem[];
  materials: { name: string; imageUrl: string }[];
}

// 수익 및 투자 대비 수익률(ROI) 계산 함수
export const calculateAnalysis = (
  item: CraftItem,
  materialPrices: { [key: string]: number },
  currentSellingPrice: number,
  taxRate: number = 0.05
) => {
  // 1. 총 재료비 계산
  const totalMaterialCost = item.ingredients.reduce((acc, ing) => {
    const unitPrice = materialPrices[ing.name] || 0;
    return acc + (unitPrice * ing.quantity);
  }, 0);

  // 2. 수수료를 제외한 실제 판매 순입금액 계산
  const netRevenue = (currentSellingPrice * item.outputQuantity) * (1 - taxRate);

  // 3. 순이익(Profit) 및 수익률(ROI) 산출
  const profit = netRevenue - totalMaterialCost;
  const roi = totalMaterialCost > 0 ? (profit / totalMaterialCost) * 100 : 0;

  return { totalMaterialCost, profit, roi };
};