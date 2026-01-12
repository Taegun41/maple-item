import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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
  materials: { name: string; imageUrl: string; price: number }[];
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

// utils/mapleUtils.ts

