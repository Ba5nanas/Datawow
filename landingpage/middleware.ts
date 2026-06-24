import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ดึง URL ของ Backend จาก environment variable
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000';

/**
 * ฟังก์ชันสำหรับส่ง Token ไปตรวจสอบความถูกต้องที่ Backend
 */
async function verifyTokenWithBackend(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.ok;
  } catch (error) {
    console.error('Middleware auth verification error:', error);
    return false;
  }
}

/**
 * ฟังก์ชันสำหรับล้าง Auth Cookies ทั้งหมด (Token & Role) 
 * และสั่ง Redirect ไปยังหน้าที่กำหนด เพื่อป้องกันไม่ให้เกิดสิทธิ์ค้าง
 */
function createLogoutResponse(redirectUrl: string, request: NextRequest) {
  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  
  // ล้างคุกกี้โดยการตั้งค่า maxAge เป็น 0
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  response.cookies.set('role', '', { maxAge: 0, path: '/' });
  
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. ปล่อยผ่าน API routes และไฟล์จำพวก static assets (ภาพ, ตัวหนังสือ) เสมอ
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.includes('.') // ปล่อยผ่านไฟล์เช่น favicon.ico, logo.png
  ) {
    return NextResponse.next();
  }
  
  // ดึงค่า token และ role จาก cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value?.toLowerCase(); // แปลงเป็นตัวพิมพ์เล็กเพื่อความแม่นยำ

  // เช็คประเภทของหน้าเว็บด้วยการเปรียบเทียบค่าตรงๆ (ป้องกันบั๊ก .startsWith('/') เหมารวมทั้งหมด)
  const authPaths = ['/admin/login', '/admin/register', '/user/login', '/user/register'];
  const isAuthPage = authPaths.includes(pathname);
  const isLandingPage = pathname === '/';
  const isPublic = isAuthPage || isLandingPage;
  
  // =============================================
  // เคสที่ 1: มี Token (ผู้ใช้ล็อกอินค้างไว้ในระบบ)
  // =============================================
  if (token) {
    // ส่งไปตรวจความถูกต้องที่ฝั่ง Backend
    const isValid = await verifyTokenWithBackend(token);
    
    // ถ้า Token หมดอายุ หรือเป็น Token ปลอม -> ล้างคุกกี้แล้วส่งไปหน้า Login ตามกลุ่มเซกชัน
    if (!isValid) {
      const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/user/login';
      return createLogoutResponse(loginPath, request);
    }
    
    // 🔥 [ดักการเข้าข้ามฝั่ง] USER ล็อกอินแล้ว แต่พยายามจะแอบเข้าหน้า ADMIN 
    if (role === 'user' && pathname.startsWith('/admin')) {
      // ทำลายสิทธิ์ยูสเซอร์เดิมทิ้ง แล้วบังคับเด้งไปหน้าล็อกอินแอดมิน เพื่อให้ใช้บัญชีแอดมินล็อกอินใหม่
      return createLogoutResponse('/admin/login', request);
    }
    
    // 🔥 [ดักการเข้าข้ามฝั่ง] ADMIN ล็อกอินแล้ว แต่พยายามจะแอบเข้าหน้า USER
    if (role === 'admin' && pathname.startsWith('/user')) {
      // ทำลายสิทธิ์แอดมินเดิมทิ้ง แล้วบังคับเด้งไปหน้าล็อกอินยูสเซอร์ เพื่อให้ใช้บัญชียูสเซอร์ล็อกอินใหม่
      return createLogoutResponse('/user/login', request);
    }

    // [จัดการสิทธิ์หลงลืม] ล็อกอินแล้ว แต่อุตส่าห์ไปกดเข้าหน้าแรกเว็บ หรือหน้า Login ของตัวเอง
    if (isPublic) {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      if (role === 'user') return NextResponse.redirect(new URL('/user', request.url));
    }

    // ถ้าผ่านเงื่อนไขด้านบนทั้งหมด แสดงว่าเข้าหน้าเว็บถูกตามสิทธิ์ของตัวเองแล้ว -> ปล่อยเข้าชมเว็บ
    return NextResponse.next();
  } 
  
  // =============================================
  // เคสที่ 2: ไม่มี Token (ผู้ใช้ทั่วไปที่ยังไม่ได้ล็อกอิน)
  // =============================================
  else {
    // ถ้าตั้งใจเข้าหน้าทั่วไป (หน้าแรก, หน้าล็อกอิน, หน้าสมัครสมาชิก) -> ปล่อยผ่านปกติ ห้าม Redirect วนลูป
    if (isPublic) {
      return NextResponse.next();
    }
    
    // ถ้าไม่มี Token แต่ดันพยายามพิมพ์ URL เข้าหน้าภายใน (Dashboard) ตรงๆ 
    // -> ดีดกลับไปหน้าล็อกอินของฝั่งนั้นๆ
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    } else if (pathname.startsWith('/user')) {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }
  }
  
  // สำรองเผื่อกรณีหลุดรอดเงื่อนไขทั้งหมด
  return NextResponse.next();
}

// กำหนดขอบเขตให้ Middleware ทำงานเฉพาะหน้าที่เราต้องการเช็คสิทธิ์ (ลดภาระการทำงานของเซิร์ฟเวอร์)
export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/user/:path*',
  ],
};