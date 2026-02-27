"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Legacy /agent-login route: redirects to home with auth popup (openAuth=agent).
 * Agent login is handled by AuthPopup in the header.
 */
export default function AgentLoginRedirectPage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const locale = params.locale ?? "en";

  useEffect(() => {
    router.replace(`/${locale}?openAuth=agent`);
  }, [locale, router]);

  return null;
}
