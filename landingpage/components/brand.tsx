export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`flex items-center gap-3 font-bold tracking-tight ${inverse ? 'text-white' : 'text-[#0878ae]'}`}>
      <span className={`h-8 w-8 rounded-full ${inverse ? 'bg-white' : 'bg-[#0878ae]'}`} />
      <span className="text-lg leading-none">BRAND</span>
    </div>
  );
}
