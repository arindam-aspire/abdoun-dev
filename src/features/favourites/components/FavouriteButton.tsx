"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Heart } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { useFavourites } from "@/features/favourites/hooks/useFavourites";
import { AuthPopup } from "@/features/auth/components/modals/AuthPopup";

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

  const onToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    toggleFavouriteForUser(propertyId);
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={cn(className, isFav ? activeClassName : inactiveClassName)}
        aria-label={isFav ? ariaLabelRemove : ariaLabelAdd}
      >
        <Heart
          className={cn(iconClassName, isFav && "fill-red-500 text-red-500")}
          aria-hidden
        />
      </button>

      <AuthPopup
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        locale={locale}
      />
    </>
  );
}

