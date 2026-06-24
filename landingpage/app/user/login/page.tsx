import Link from 'next/link';
import { AuthField } from '../../../components/auth-field';
import { AuthLayout } from '../../../components/auth-layout';

export default function LoginPage() {
  return (
    <AuthLayout>
      {/* ลดขนาดความกว้างสูงสุดของฟอร์มลงเล็กน้อย จาก 590px เหลือ 450px เพื่อความกระชับ */}
      <form className="w-full max-w-[450px] px-4">
        
        {/* หัวข้อ Login: ลดขนาดจาก text-5xl -> text-2xl/3xl */}
        <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Login
        </h1>

        {/* ช่องกรอกข้อมูล: ลดระยะห่างด้านบนจาก mt-24 -> mt-8 และลดระยะห่างระหว่างช่องจาก space-y-9 -> space-y-4 */}
        <div className="mt-8 space-y-4">
          <AuthField label="Email" placeholder="Enter your Email Address" />
          <AuthField label="Password" placeholder="Enter your Password" password />
        </div>

        {/* ปุ่ม Login: ลดความสูงจาก h-16 -> h-11 และลดขนาดตัวหนังสือเหลือ text-base */}
        <button 
          type="button" 
          className="mt-6 h-11 w-full rounded-lg bg-[#248ee0] text-base font-semibold text-white transition hover:bg-[#147bc9]"
        >
          Login as Administrator
        </button>

        {/* ข้อความด้านล่าง: ลดระยะห่างจาก mt-12 -> mt-6 และลดขนาดฟอนต์จาก text-2xl -> text-sm */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link href="/user/register" className="font-medium text-[#248ee0] hover:underline">
            Create an account
          </Link>
        </p>
        
      </form>
    </AuthLayout>
  );
}