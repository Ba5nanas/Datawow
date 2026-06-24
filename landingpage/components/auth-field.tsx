import { EyeOffIcon, LockIcon, UserIcon } from './icons';

export function AuthField({ label, placeholder, password = false }: { label: string; placeholder: string; password?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium sm:text-base">{label}</span>
      <span className="flex h-10 items-center rounded-md border border-[#555] px-3 text-[#1d1d1f]">
        {password ? <LockIcon className="mr-3 h-5 w-5 shrink-0" /> : <UserIcon className="mr-3 h-5 w-5 shrink-0" />}
        <input type={password ? 'password' : 'text'} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#bcbcbc] sm:text-base" />
        {password && <EyeOffIcon />}
      </span>
    </label>
  );
}
