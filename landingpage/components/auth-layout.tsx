import { ReactNode } from 'react';
import { Brand } from './brand';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white md:grid-cols-2">
      <aside className="relative flex min-h-[40vh] flex-col overflow-hidden bg-[#0878ae] px-6 py-6 text-white md:min-h-screen md:px-[10.4%] md:py-[7.5%]">
        <Brand inverse />
        <div className="mt-auto max-w-xl pt-12 md:pt-0">
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">"Powering the tools that<br className="hidden lg:block" /> power the team."</h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed sm:text-base">Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non.</p>
        </div>
      </aside>
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 md:px-[13%]">{children}</section>
    </main>
  );
}
