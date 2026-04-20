"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Heart, Loader2 } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { useFavourites } from "@/features/favourites/hooks/useFavourites";
import { AuthPopup } from "@/features/auth/components/modals/AuthPopup";
import { Toast } from "@/components/ui";

export interface FavouriteButtonProps {
  propertyId: number;
  className?: string;
  iconClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  ariaLabelAdd?: string;
  ariaLabelRemove?: string;
}

export function FavouriteButton({
  propertyId,
  className,
  iconClassName,
  activeClassName,
  inactiveClassName,
  ariaLabelAdd = "Save property",
  ariaLabelRemove = "Remove from favourites",
}: FavouriteButtonProps) {
  const locale = useLocale() as AppLocale;
  const { isFavourite, toggleFavouriteForUser, isAuthenticated } = useFavourites();
  const isFav = isFavourite(propertyId);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    kind: "info" | "error" | "success";
    message: string;
  } | null>(null);

  const onToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await toggleFavouriteForUser(propertyId);
      if (!result.ok) {
        setToast({
          kind: "error",
          message: result.message || "Could not update favourite. Please try again.",
        });
        return;
      }
      setToast({
        kind: "success",
        message:
          result.action === "added"
            ? "Property added to favourites."
            : "Property removed from favourites.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={cn(className, isFav ? activeClassName : inactiveClassName)}
        aria-label={isFav ? ariaLabelRemove : ariaLabelAdd}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className={cn(iconClassName, "animate-spin")} aria-hidden />
        ) : (
          <Heart
            className={cn(iconClassName, isFav && "fill-red-500 text-red-500")}
            aria-hidden
          />
        )}
      </button>

      <AuthPopup
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        locale={locale}
      />

      {toast ? (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      ) : null}
    </>
  );
}

