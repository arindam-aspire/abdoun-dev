import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import {
  addToCompare,
  clearCompare,
  MAX_COMPARE_ITEMS,
  removeFromCompare,
} from "@/features/compare/compareSlice";

export type UseCompareSelectionResult = {
  selectedIds: number[];
  isSelected: (id: number) => boolean;
  toggleSelected: (id: number) => void;
  canCompare: boolean;
  maxSelectable: number;
  clearAll: () => void;
};

export function useCompareSelection(): UseCompareSelectionResult {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector((state) => state.compare.propertyIds);

  const isSelected = useCallback((id: number) => selectedIds.includes(id), [selectedIds]);

  const toggleSelected = useCallback(
    (id: number) => {
      if (selectedIds.includes(id)) {
        dispatch(removeFromCompare(id));
        return;
      }
      if (selectedIds.length < MAX_COMPARE_ITEMS) {
        dispatch(addToCompare(id));
      }
    },
    [dispatch, selectedIds],
  );

  const clearAll = useCallback(() => {
    dispatch(clearCompare());
  }, [dispatch]);

  const canCompare = selectedIds.length >= 2;

  return useMemo(
    () => ({
      selectedIds,
      isSelected,
      toggleSelected,
      canCompare,
      maxSelectable: MAX_COMPARE_ITEMS,
      clearAll,
    }),
    [canCompare, clearAll, isSelected, selectedIds, toggleSelected],
  );
}

