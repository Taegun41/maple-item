// src/utils/mapleUtils.ts

export interface Ingredient {
  imageUrl: string;
  name: string;
  quantity: number;
}

export interface CraftItem {
  id: string;
  name: string;
  price: number; // 만 단위
  imageUrl: string;
  outputQuantity: number;
  ingredients: Ingredient[];
}

export interface Database {
  items: CraftItem[];
  materials: { name: string; imageUrl: string }[];
}

// 수익 및 ROI 계산 로직
export const calculateAnalysis = (
  item: CraftItem,
  materialPrices: { [key: string]: number },
  currentSellingPrice: number,
  taxRate: number = 0.05
) => {
  const totalMaterialCost = item.ingredients.reduce((acc, ing) => {
    const unitPrice = materialPrices[ing.name] || 0;
    return acc + (unitPrice * ing.quantity);
  }, 0);

  const netRevenue = (currentSellingPrice * item.outputQuantity) * (1 - taxRate);
  const profit = netRevenue - totalMaterialCost;
  const roi = totalMaterialCost > 0 ? (profit / totalMaterialCost) * 100 : 0;

  return { totalMaterialCost, profit, roi };
};

// DB 읽기/쓰기 API 호출 함수
export const fetchDb = async (): Promise<Database> => {
  const res = await fetch('/db.json', { cache: 'no-store' });
  return res.json();
};

export const saveDb = async (data: Database) => {
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.ok;
};