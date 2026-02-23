import { Alert, AlertDescription } from "@/components/ui";

interface AuthAlertProps {
  kind?: "info" | "error" | "success";
  message: string;
}

export function AuthAlert({ kind = "info", message }: AuthAlertProps) {
  const variant = kind === "error" ? "destructive" : kind === "success" ? "success" : "info";
  return (
    <Alert variant={variant} className="py-3">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
