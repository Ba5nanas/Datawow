export function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  const expires = `expires=${date.toUTCString()}`;

  /**
   * ปกติใช้ Lax พอ
   * ใช้ SameSite=None เฉพาะกรณี cross-site จริง ๆ เช่น iframe / คนละ site
   */
  const sameSite = 'SameSite=Lax';

  /**
   * ถ้า production และใช้ https ให้ใส่ Secure
   * localhost dev ไม่ต้องใส่
   */
  const secure = process.env.NODE_ENV === 'production' ? 'Secure' : '';

  const cookieParts = [
    `${name}=${encodeURIComponent(value)}`,
    expires,
    'path=/',
    sameSite,
    secure,
  ].filter(Boolean);

  document.cookie = cookieParts.join('; ');
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split('; ');

  const cookie = cookies.find((row) => row.startsWith(`${name}=`));

  if (!cookie) return null;

  const value = cookie.split('=').slice(1).join('=');

  return decodeURIComponent(value);
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;

  const secure = process.env.NODE_ENV === 'production' ? 'Secure' : '';

  const cookieParts = [
    `${name}=`,
    'expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'path=/',
    'SameSite=Lax',
    secure,
  ].filter(Boolean);

  document.cookie = cookieParts.join('; ');
}