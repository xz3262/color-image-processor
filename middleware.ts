import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 对于 API 路由，确保环境变量存在
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!process.env.CLAUDE_API_KEY && request.nextUrl.pathname === '/api/process-image') {
      return NextResponse.json(
        { error: 'Claude API Key 未配置' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};