interface AuthProviderLogoProps {
  text: string;
  className: string;
}

export function AuthProviderLogo({ text, className }: AuthProviderLogoProps) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${className}`}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
