import type { NextConfig } from 'next';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPlugins = require('next-compose-plugins');

const nextConfig: NextConfig = {
  // Next.js 15에서는 appDir이 기본값이므로 제거
  images: {
    // 이미지 최적화 완전 비활성화
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'img1.kakaocdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 't1.kakaocdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't1.kakaocdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

// Sentry 설정
const sentryOptions = {
  sentry: {
    hideSourceMaps: true,
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
};

// PWA와 Sentry 플러그인을 함께 사용
const plugins = [[withPWA, {}]];

export default withSentryConfig(
  withPlugins(plugins, nextConfig),
  sentryOptions,
  sentryWebpackPluginOptions
);
