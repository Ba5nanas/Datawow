import Link from 'next/link';
import { Brand } from '../components/brand';

// ==========================================
// 1. COMPONENT: AccessIcon (ปรับขนาดจาก h-20 w-20 -> h-12 w-12)
// ==========================================
interface AccessIconProps {
  admin?: boolean;
}

function AccessIcon({ admin }: AccessIconProps) {
  if (admin) {
    return (
      <svg className="h-12 w-12" viewBox="0 0 88 88" fill="none">
        <circle cx="35" cy="21" r="13" stroke="currentColor" strokeWidth="8" />
        <path d="M10 65c0-14 11-25 25-25s25 11 25 25" stroke="currentColor" strokeWidth="8" />
        <path d="m61 44 4 7 8-1 1 8 7 4-4 7 4 7-7 4-1 8-8-1-4 7-7-4-7 4-4-7-8 1-1-8-7-4 4-7-4-7 7-4 1-8 8 1 4-7 7 4Z" fill="currentColor" />
        <circle cx="61" cy="65" r="8" fill="#0878ae" />
      </svg>
    );
  }

  return (
    <svg className="h-12 w-12" viewBox="0 0 88 88" fill="none">
      <path d="M18 12h48a5 5 0 0 1 5 5v39a5 5 0 0 1-5 5H31L18 74V17a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="7" />
      <circle cx="45" cy="31" r="9" fill="currentColor" />
      <path d="M29 52c0-9 7-16 16-16s16 7 16 16" fill="currentColor" />
    </svg>
  );
}

// ==========================================
// 2. COMPONENT: AccessCard (ลด min-h, px, py และขนาดฟอนต์)
// ==========================================
interface AccessCardProps {
  title: string;
  admin: boolean;
  href: string;
}

function AccessCard({ title, admin, href }: AccessCardProps) {
  const cardStyle = admin 
    ? 'bg-[#0878ae] text-white' 
    : 'bg-white text-[#0878ae] shadow-[0_10px_25px_rgba(0,0,0,0.05)]';

  const buttonStyle = admin 
    ? 'bg-white text-[#0878ae]' 
    : 'bg-[#0878ae] text-white';

  return (
    // ลดความสูงเครื่องจาก 780px เหลือกระชับที่ประมาณ 450px (md:min-h-[450px])
    <article className={`flex min-h-[380px] flex-col rounded-2xl p-8 sm:p-12 md:min-h-[450px] md:p-14 ${cardStyle}`}>
      <AccessIcon admin={admin} />
      
      {/* ลดขนาดหัวข้อจาก text-5xl -> text-2xl/3xl */}
      <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
        {title}
      </h2>
      
      {/* ลดขนาดเนื้อหาและช่องไฟจาก mt-14 -> mt-4, text-xl -> text-base */}
      <p className="mt-4 max-w-md text-base leading-relaxed opacity-90">
        Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non
      </p>

      {/* ลดความสูงปุ่มจาก h-20 -> h-12 และฟอนต์เหลือ text-base */}
      <Link 
        href={href} 
        className={`mt-auto flex h-12 items-center justify-center rounded-lg text-base font-semibold transition hover:opacity-90 ${buttonStyle}`}
      >
        Enter {admin ? 'Portal' : 'Workspace'} 
        <span className="ml-2">→</span>
      </Link>
    </article>
  );
}

// ==========================================
// 3. MAIN PAGE COMPONENT (ลดช่องไฟ Header, Section และหัวข้อหลัก)
// ==========================================
export default function AccessPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-black">
      {/* Header: ลดความสูงลงให้สมดุล */}
      <header className="flex h-20 items-center bg-white px-6 sm:px-12 md:h-24">
        <Brand />
      </header>

      {/* Section: ลด max-w ไม่ให้จอกว้างเกินไป และลด padding ยักษ์ลง */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-12 md:py-20">
        
        {/* Title: จาก text-[4rem] (64px) ลดเหลือ text-3xl/4xl (36px) กำลังสวย */}
        <div className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Select Access Level
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Lorem ipsum dolor sit amet consectetur. Elit purus nam.
          </p>
        </div>

        {/* Grid: ลด max-w และลดความห่างระหว่างสองการ์ด (gap-36 -> gap-10) */}
        <div className="mx-auto mt-10 grid max-w-[900px] gap-6 sm:grid-cols-2 md:mt-16 md:gap-10">
          <AccessCard title="User" admin={false} href="/user/login" />
          <AccessCard title="Administrator" admin={true} href="/admin/login" />
        </div>
      </section>
    </main>
  );
}