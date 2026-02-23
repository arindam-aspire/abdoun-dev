import type { SocialProvider } from "@/services/authMockService";
import { Button } from "@/components/ui";

interface SocialAuthButtonsProps {
  loading?: boolean;
  onSelect: (provider: SocialProvider) => void;
}

const providers: Array<{ key: SocialProvider; label: string }> = [
  { key: "google", label: "Continue with Google" },
  { key: "apple", label: "Continue with Apple" },
  { key: "facebook", label: "Continue with Facebook" },
];

export function SocialAuthButtons({ loading, onSelect }: SocialAuthButtonsProps) {
  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <Button
          key={provider.key}
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={loading}
          onClick={() => onSelect(provider.key)}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
