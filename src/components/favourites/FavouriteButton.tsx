"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Heart } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { toggleFavourite } from "@/features/favourites/favouritesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { selectCurrentUser } from "@/store/selectors";
import { AuthPopup } from "@/components/auth/AuthPopup";

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
  const dispatch = useAppDispatch();
  const locale = useLocale() as AppLocale;
  const user = useAppSelector(selectCurrentUser);
  const propertyIds = useAppSelector((state) => state.favourites.propertyIds);
  const isFavourite = user ? propertyIds.includes(propertyId) : false;
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const onToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    dispatch(toggleFavourite(propertyId));
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={cn(className, isFavourite ? activeClassName : inactiveClassName)}
        aria-label={isFavourite ? ariaLabelRemove : ariaLabelAdd}
      >
        <Heart
          className={cn(iconClassName, isFavourite && "fill-red-500 text-red-500")}
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
