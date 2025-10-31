import { NextRequest, NextResponse } from 'next/server';

/**
 * Stores access and refresh tokens as HTTP cookies and returns a success response.
 *
 * Expects the request body JSON to contain `accessToken` and `refreshToken`. On success returns a JSON response `{ success: true }` and sets an `accessToken` cookie (maxAge 7 days) and a `refreshToken` cookie (maxAge 30 days) with `sameSite: 'strict'` and `secure` enabled only when `NODE_ENV` is `'production'`. If either token is missing responds with a 400 JSON error `{ error: '토큰이 필요합니다.' }`. On unexpected errors responds with a 500 JSON error `{ error: '토큰 저장에 실패했습니다.' }`.
 *
 * @param request - NextRequest whose JSON body must include `accessToken` and `refreshToken`
 * @returns A NextResponse containing either the success JSON with cookies set, or a JSON error with the corresponding HTTP status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken } = body;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: '토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    // 응답 생성
    const response = NextResponse.json({ success: true });

    // 쿠키 설정 (Secure 플래그 포함, HTTPS 환경 대응)
    response.cookies.set('accessToken', accessToken, {
      httpOnly: false, // 클라이언트 JavaScript에서 접근 가능 (auth.ts에서 사용)
      secure: process.env.NODE_ENV === 'production', // HTTPS일 때만
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: false, // 클라이언트 JavaScript에서 접근 가능
      secure: process.env.NODE_ENV === 'production', // HTTPS일 때만
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('토큰 저장 중 오류:', error);
    return NextResponse.json(
      { error: '토큰 저장에 실패했습니다.' },
      { status: 500 }
    );
  }
}