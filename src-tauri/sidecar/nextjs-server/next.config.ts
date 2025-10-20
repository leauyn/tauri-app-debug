import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // 启用 standalone 输出模式，生成独立的服务器文件
  output: 'standalone',
  // 禁用 x-powered-by 头
  poweredByHeader: false,
  // 压缩
  compress: true,
  // 设置输出文件跟踪根目录，避免工作区检测问题
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
