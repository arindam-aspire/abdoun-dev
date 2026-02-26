interface PasswordPolicyHelperProps {
  checks: {
    minLength: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    symbol: boolean;
  };
}

const itemClass = (ok: boolean) =>
  `text-size-xs ${ok ? "text-emerald-600" : "text-zinc-500"}`;

export function PasswordPolicyHelper({ checks }: PasswordPolicyHelperProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-size-xs fw-medium text-zinc-700">Password policy:</p>
      <ul className="mt-2 space-y-1">
        <li className={itemClass(checks.minLength)}>At least 8 characters</li>
        <li className={itemClass(checks.upper)}>One uppercase letter</li>
        <li className={itemClass(checks.lower)}>One lowercase letter</li>
        <li className={itemClass(checks.number)}>One number</li>
        <li className={itemClass(checks.symbol)}>One special character</li>
      </ul>
    </div>
  );
}

