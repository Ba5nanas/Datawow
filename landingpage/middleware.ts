import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// URL ของ Landing Page สำหรับเรียก API
const BACKEND_URL =
  process.env.BACKEND_URL || 'http://backend:3000';

type UserRole = 'admin' | 'user';

/**
 * ตรวจว่า request นี้เป็น prefetch / request แอบยิงของ Next.js หรือไม่
 * request พวกนี้ห้าม logout / ห้ามล้าง cookie
 */
function isPrefetchRequest(request: NextRequest): boolean {
  return (
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('x-middleware-prefetch') === '1' ||
    Boolean(request.headers.get('sec-purpose')?.includes('prefetch'))
  );
}

/**
 * ตรวจว่าเป็น RSC request ของ Next.js หรือไม่
 * พวกนี้ไม่ใช่การเปิด page จริง
 */
function isRSCRequest(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || '';

  return (
    request.headers.get('rsc') === '1' ||
    accept.includes('text/x-component')
  );
}

/**
 * ตรวจว่าเป็นการเปิดหน้าเว็บจริงจาก browser หรือไม่
 *
 * ใช้สำหรับตัดสินใจว่า:
 * - ถ้า admin เปิด /user จริง ๆ => logout
 * - ถ้า user เปิด /admin จริง ๆ => logout
 *
 * แต่ถ้าเป็น prefetch / RSC / request แอบยิง => ไม่ logout
 */
function isRealPageNavigation(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || '';
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';
  const secFetchMode = request.headers.get('sec-fetch-mode') || '';

  if (isPrefetchRequest(request)) return false;
  if (isRSCRequest(request)) return false;

  return (
    secFetchDest === 'document' ||
    secFetchMode === 'navigate' ||
    accept.includes('text/html')
  );
}

/**
 * ตรวจ token กับ backend / api verify
 */
async function verifyTokenWithBackend(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    return response.ok;
  } catch (error) {
    console.error('Middleware auth verification error:', error);
    return false;
  }
}

/**
 * ล้าง cookie token + role
 * ถ้า redirectUrl เป็น path เดียวกับหน้าปัจจุบัน จะไม่ redirect ซ้ำ
 * แต่จะ NextResponse.next() พร้อมล้าง cookie แทน
 */
function createLogoutResponse(redirectUrl: string, request: NextRequest) {
  const targetUrl = new URL(redirectUrl, request.url);

  const response =
    request.nextUrl.pathname === targetUrl.pathname
      ? NextResponse.next()
      : NextResponse.redirect(targetUrl);

  response.cookies.set('token', '', {
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('role', '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ปล่อยผ่าน API routes และ static assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  /**
   * ดึง section แรกของ path
   *
   * /admin         => admin
   * /admin/login   => admin
   * /user          => user
   * /user/login    => user
   * /              => ''
   */
  const section = pathname.split('/').filter(Boolean)[0] || '';

  const isAdminPath = section === 'admin';
  const isUserPath = section === 'user';

  const authPaths = [
    '/admin/login',
    '/admin/register',
    '/user/login',
    '/user/register',
  ];

  const isAuthPage = authPaths.includes(pathname);
  const isLandingPage = pathname === '/';
  const isPublic = isAuthPage || isLandingPage;

  const token = request.cookies.get('token')?.value;

  const role = request.cookies
    .get('role')
    ?.value
    ?.toLowerCase() as UserRole | undefined;

  const isRealPage = isRealPageNavigation(request);


  // =========================================
  // CASE 1: ไม่มี token
  // =========================================
  if (!token) {
    // หน้า public เข้าได้
    if (isPublic) {
      return NextResponse.next();
    }

    // ไม่มี token แล้วเข้า admin
    if (isAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // ไม่มี token แล้วเข้า user
    if (isUserPath) {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }

    return NextResponse.next();
  }

  // =========================================
  // CASE 2: มี token
  // =========================================

  const isValid = await verifyTokenWithBackend(token);

   console.log('middleware debug:', {
    url: request.url,
    pathname,
    section,
    role,
    hasToken: Boolean(token),
    isAdminPath,
    isUserPath,
    isAuthPage,
    isPublic,
    isRealPage,
    prefetch: isPrefetchRequest(request),
    rsc: isRSCRequest(request),
    secFetchDest: request.headers.get('sec-fetch-dest'),
    secFetchMode: request.headers.get('sec-fetch-mode'),
    accept: request.headers.get('accept'),
  });
  
  console.log(isValid);
  // token หมดอายุ / token ปลอม
  if (!isValid) {
    const loginPath = isAdminPath ? '/admin/login' : '/user/login';
    return createLogoutResponse(loginPath, request);
  }

   

  // role แปลก / role หาย
  if (role !== 'admin' && role !== 'user') {
    const loginPath = isAdminPath ? '/admin/login' : '/user/login';
    return createLogoutResponse(loginPath, request);
  }

  // =========================================
  // ดักเข้าข้ามฝั่ง ตามหลักการที่ต้องการ
  //
  // ADMIN เข้า /user จริง ๆ  => logout => /user/login
  // USER เข้า /admin จริง ๆ  => logout => /admin/login
  //
  // แต่ถ้าเป็น prefetch / RSC / request แอบยิง
  // จะ block 403 เฉย ๆ และไม่ล้าง cookie
  // =========================================

  if (role === 'admin' && isUserPath) {
    if (isRealPage) {
      return createLogoutResponse('/user/login', request);
    }

    return new NextResponse(null, { status: 403 });
  }

  if (role === 'user' && isAdminPath) {
    if (isRealPage) {
      return createLogoutResponse('/admin/login', request);
    }

    return new NextResponse(null, { status: 403 });
  }

  // =========================================
  // login แล้ว แต่กลับไปหน้า public / login / register
  // =========================================
  if (isPublic) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (role === 'user') {
      return NextResponse.redirect(new URL('/user', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/user/:path*'],
};