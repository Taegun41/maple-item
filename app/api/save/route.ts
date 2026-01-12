// src/app/api/save/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // public/db.json 파일의 절대 경로를 잡습니다.
    const filePath = path.join(process.cwd(), 'public', 'db.json');
    
    // 데이터를 예쁘게 정렬하여 파일에 씁니다.
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
// src/app/api/save/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'db.json');
    
    // JSON 데이터를 파일에 기록 (로컬 서버에서만 작동)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ message: 'Error', error }, { status: 500 });
  }
}