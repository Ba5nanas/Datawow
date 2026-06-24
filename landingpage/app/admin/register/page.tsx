import Link from 'next/link';
import { AuthField } from '../../../components/auth-field';
import { AuthLayout } from '../../../components/auth-layout';

export default function RegisterPage() {
  return (
    <AuthLayout>
      {/* ปรับความกว้างกล่องฟอร์มลงจาก 590px เหลือ 450px เพื่อความกระชับและสมมาตรกับหน้า Login */}
      <form className="w-full max-w-[450px] px-4">
        
        {/* หัวข้อ Sign Up: ปรับลดขนาดลงมาที่ text-2xl / sm:text-3xl */}
        <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Sign Up
        </h1>

        {/* กลุ่มช่องกรอกข้อมูล: ลดช่องไฟด้านบนจาก mt-16 -> mt-8 และระยะห่างแต่ละช่องจาก space-y-9 -> space-y-4 */}
        <div className="mt-8 space-y-4">
          <AuthField label="Full name" placeholder="Enter your Full Name" />
          <AuthField label="Email" placeholder="Enter your Email Address" />
          <AuthField label="Password" placeholder="Create a Password" password />
          <AuthField label="Confirm Password" placeholder="Re-enter your Password" password />
        </div>

        {/* ปุ่มสมัครสมาชิก: เปลี่ยนความสูงจาก h-16 -> h-11 และลดขนาดตัวหนังสือเหลือ text-base */}
        <Link 
          href="/access" 
          className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-[#248ee0] text-base font-semibold text-white transition hover:bg-[#147bc9]"
        >
          Create an account
        </Link>

        {/* ลิงก์สลับไปหน้า Login: ลดช่องไฟลงเป็น mt-6 และขนาดตัวหนังสือเหลือ text-sm */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/admin/login" className="font-medium text-[#248ee0] hover:underline">
            Login
          </Link>
        </p>
        
      </form>
    </AuthLayout>
  );
}