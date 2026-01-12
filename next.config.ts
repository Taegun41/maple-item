import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '/maple-item'; // 태건님의 레포지토리 이름을 입력하세요.

const nextConfig: NextConfig = {
  output: 'export',
  // 배포 환경일 때만 레포지토리 이름을 경로 앞에 붙여줍니다.
  basePath: isProd ? repoName : '',
  assetPrefix: isProd ? repoName : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;