"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Mail, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { Button, Input, Label } from "@/components/ui";
import { useTranslations } from "@/hooks/useTranslations";
import { login } from "@/features/auth/authSlice";
import type { UserRole } from "@/features/auth/authSlice";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function LocalizedSignupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale || "en";
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    dispatch(
      login({
        id: "1",
        name: fullName || "New User",
        email: email || "user@agency.com",
        role: "user" as UserRole,
      }),
    );
    router.push(`/${locale}/dashboard`);
  };

  return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        {/* Logo - same as home page header */}
        <div className="flex justify-center">
          <BrandLogo locale={locale} imageClassName="h-12 w-auto" />
        </div>

        <h1 className="mt-5 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
          {t("signupTitle")}
        </h1>
        <p className="mt-1.5 text-center text-sm text-zinc-600">
          {t("signupSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">{t("fullName")}</Label>
            <div className="relative">
              <Input
                id="signup-name"
                type="text"
                placeholder={t("fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pr-10"
                autoComplete="name"
              />
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">{t("emailAddress")}</Label>
            <div className="relative">
              <Input
                id="signup-email"
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
            <Label htmlFor="signup-password">{t("password")}</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 rounded p-0.5"
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

          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">
              {t("confirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 rounded p-0.5"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full mt-2"
          >
            {t("submitSignup")}
            <ArrowRight className="h-4 w-4 rtl-flip-x" aria-hidden />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          {t("haveAccountSignIn")}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-semibold text-zinc-900 hover:underline"
          >
            {t("signInLink")}
          </Link>
        </p>
      </div>
  );
}

