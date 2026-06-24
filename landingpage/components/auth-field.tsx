import { useState } from 'react';
import { EyeOffIcon, EyeIcon, LockIcon, UserIcon } from './icons';

interface AuthFieldProps {
  label: string;
  placeholder: string;
  name: string;
  password?: boolean;
}

export function AuthField({ label, placeholder, name, password = false }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-700">{label}</span>
      <span className="flex h-10 items-center rounded-lg border border-gray-300 px-3 text-[#1d1d1f] focus-within:border-[#248ee0] focus-within:ring-1 focus-within:ring-[#248ee0]">
        {password ? <LockIcon className="mr-3 h-4 w-4 shrink-0 text-gray-400" /> : <UserIcon className="mr-3 h-4 w-4 shrink-0 text-gray-400" />}
        
        <input 
          type={password ? (showPassword ? 'text' : 'password') : 'text'} 
          name={name} 
          placeholder={placeholder} 
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#bcbcbc]" 
        />
        
        {password && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer"
          >
            {showPassword ? (
              <EyeIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeOffIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        )}
      </span>
    </label>
  );
}