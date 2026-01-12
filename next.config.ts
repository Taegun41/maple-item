// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/your-repo-name'; // 깃허브 저장소 이름을 입력하세요 (예: /maple-calc)

const nextConfig: NextConfig = {
  output: 'export', // 정적 배포를 위한 필수 설정
  basePath: isProd ? repoName : '', // 배포 환경에서의 경로 접두사
  assetPrefix: isProd ? repoName : '', // 정적 자산 경로 접두사
  images: {
    unoptimized: true, // 정적 내보내기 시 이미지 최적화 비활성화
  },
};

export default nextConfig;