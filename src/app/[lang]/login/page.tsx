"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Building2, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { Button, Input, Label } from "@/components/ui";
import { useTranslations } from "@/hooks/useTranslations";
import { login } from "@/features/auth/authSlice";
import type { UserRole } from "@/features/auth/authSlice";

export default function LocalizedLoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params.lang || "en";
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login: accept any email/password and redirect to localized dashboard
    dispatch(
      login({
        id: "1",
        name: "Demo User",
        email: email || "demo@agency.com",
        role: "user" as UserRole,
      }),
    );
    router.push(`/${lang}/dashboard`);
  };

  const handleGoogleSignIn = () => {
    // Mock Google sign-in: in a real implementation, replace this with
    // Google OAuth (e.g. NextAuth/Auth.js or your backend API).
    dispatch(
      login({
        id: "google-demo",
        name: "Google Demo User",
        email: "google-demo@abdoun-realestate.com",
        role: "user" as UserRole,
      }),
    );
    router.push(`/${lang}/dashboard`);
  };

  return (
    <AuthCardLayout>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        {/* Logo - same as home page header, clickable to localized home */}
        <div className="flex justify-center">
          <Link
            href={`/${lang}`}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700 transition-colors"
            aria-label="Go to home page"
          >
            <Building2 className="h-7 w-7" aria-hidden />
          </Link>
        </div>

        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("welcomeBack")}
        </h1>
        <p className="mt-1.5 text-center text-sm text-zinc-600">
          {t("loginSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">{t("emailAddress")}</Label>
            <div className="relative">
              <Input
                id="login-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10"
                autoComplete="email"
              />
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="login-password">{t("password")}</Label>
              <Link
                href={`/${lang}/forgot-password`}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 rounded p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full mt-2"
          >
            {t("logIn")}
            <ArrowRight className="h-4 w-4 rtl-flip-x" aria-hidden />
          </Button>
          <span className="flex items-center justify-center text-center text-sm text-zinc-600">or</span>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full mt-3 flex items-center justify-center gap-2 bg-white"
            onClick={handleGoogleSignIn}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white">
              <span className="text-xs font-bold text-sky-600">G</span>
            </span>
            <span>{t("continueWithGoogle")}</span>
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          {t("noAccountSignUp")}{" "}
          <Link
            href={`/${lang}/signup`}
            className="font-semibold text-zinc-900 hover:underline"
          >
            {t("signUpLink")}
          </Link>
        </p>
      </div>
    </AuthCardLayout>
  );
}

