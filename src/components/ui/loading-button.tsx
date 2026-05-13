import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  spinnerSize?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function LoadingButton({
  loading = false,
  spinnerSize = "sm",
  children,
  disabled,
  ...rest
}: LoadingButtonProps) {
  return (
    <Button
      {...rest}
      disabled={Boolean(loading) || disabled === true}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner size={spinnerSize} />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

