"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { DialogRoot } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import {
  createOfflineLead,
  searchLeadProperties,
  type LeadPropertySearchOption,
  type LeadPropertySearchResult,
} from "@/features/leads/api/leadApiService";
import { getLeadSourceLabel } from "@/features/leads/utils/leadDisplay";
import { getApiErrorMessage } from "@/lib/http/apiError";
import type { OfflineLeadCreatePayload } from "@/types/lead";

type Mode = "agent" | "admin";

type AgentOption = {
  value: string;
  label: string;
};

type FieldErrors = Partial<Record<keyof OfflineLeadCreatePayload | "property", string>>;

const INQUIRY_TYPE_OPTIONS: Array<OfflineLeadCreatePayload["inquiryType"]> = ["BUY", "RENT", "SELL", "OTHER"];
const SOURCE_OPTIONS: Array<OfflineLeadCreatePayload["source"]> = [
  "PHONE",
  "WHATSAPP",
  "WALK_IN",
  "FACEBOOK",
  "REFERRAL",
  "OTHER",
];
const PROPERTY_PAGE_SIZE = 10;
const PROPERTY_SEARCH_DEBOUNCE_MS = 350;
const PROPERTY_AUTO_EXPAND_MAX_PAGES = 4;

export type CreateOfflineLeadModalProps = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  onError: (message: string) => void;
  onSuccessToast: (message: string) => void;
  agentOptions?: AgentOption[];
  agentsLoading?: boolean;
};

export function CreateOfflineLeadModal({
  open,
  mode,
  onClose,
  onSuccess,
  onError,
  onSuccessToast,
  agentOptions = [],
  agentsLoading = false,
}: CreateOfflineLeadModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [propertySearchText, setPropertySearchText] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<LeadPropertySearchOption | null>(null);
  const [propertyOptions, setPropertyOptions] = useState<LeadPropertySearchOption[]>([]);
  const [propertyPage, setPropertyPage] = useState(1);
  const [propertyHasMore, setPropertyHasMore] = useState(false);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [propertyLoadingMore, setPropertyLoadingMore] = useState(false);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [propertyInputFocused, setPropertyInputFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [inquiryType, setInquiryType] = useState<OfflineLeadCreatePayload["inquiryType"]>("BUY");
  const [source, setSource] = useState<OfflineLeadCreatePayload["source"]>("PHONE");
  const [notes, setNotes] = useState("");
  const [assignedAgentId, setAssignedAgentId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const propertyFieldRef = useRef<HTMLDivElement | null>(null);
  const propertyQueryCacheRef = useRef<Map<string, { items: LeadPropertySearchOption[]; hasMore: boolean }>>(new Map());
  const propertyInFlightRef = useRef<Set<string>>(new Set());
  const latestPropertyRequestRef = useRef(0);
  const previousQueryRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setCustomerName("");
    setPhoneNumber("");
    setPropertySearchText("");
    setSelectedProperty(null);
    setPropertyOptions([]);
    setPropertyPage(1);
    setPropertyHasMore(false);
    setPropertyLoading(false);
    setPropertyLoadingMore(false);
    setPropertyError(null);
    setPropertyInputFocused(false);
    setHighlightedIndex(-1);
    setInquiryType("BUY");
    setSource("PHONE");
    setNotes("");
    setAssignedAgentId("");
    setErrors({});
    setSubmitting(false);
    previousQueryRef.current = null;
    latestPropertyRequestRef.current = 0;
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    reset();
    onClose();
  }, [onClose, reset, submitting]);

  const validate = useCallback((): boolean => {
    const next: FieldErrors = {};
    const trimmedCustomer = customerName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedPropertyName = propertySearchText.trim();
    const selectedPropertyId = selectedProperty?.propertyId?.trim() || "";

    if (!trimmedCustomer) next.customerName = "Customer name is required.";
    if (!trimmedPhone) next.phoneNumber = "Phone number is required.";
    if (trimmedPhone && !/^[0-9+()\-\s]{6,20}$/.test(trimmedPhone)) {
      next.phoneNumber = "Enter a valid phone number.";
    }
    if (!selectedPropertyId && !trimmedPropertyName) {
      next.property = "Property is required.";
    }
    if (mode === "admin" && !assignedAgentId.trim()) {
      next.assignedAgentId = "Assigned agent is required for admin.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [assignedAgentId, customerName, mode, phoneNumber, propertySearchText, selectedProperty]);

  const normalizedPropertyQuery = useMemo(() => {
    const term = propertySearchText.trim();
    if (!propertyInputFocused || selectedProperty) return "";
    return term.length >= 2 ? term : "";
  }, [propertyInputFocused, propertySearchText, selectedProperty]);
  const isTypedPropertySearch = normalizedPropertyQuery.length >= 2;

  const normalizeText = useCallback((value: string | null | undefined): string => {
    return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  }, []);

  const tokenizeQuery = useCallback(
    (value: string): string[] => {
      return normalizeText(value)
        .split(" ")
        .map((token) => token.trim())
        .filter(Boolean);
    },
    [normalizeText],
  );

  const propertyMatchScore = useCallback(
    (option: LeadPropertySearchOption, query: string): number => {
      const normalizedQuery = normalizeText(query);
      if (!normalizedQuery) return 0;
      const tokens = tokenizeQuery(normalizedQuery);
      const title = normalizeText(option.title);
      const location = normalizeText(option.location ?? "");
      const city = normalizeText(option.city ?? "");
      const area = normalizeText(option.area ?? "");
      const reference = normalizeText(option.referenceNumber ?? "");
      const hash = option.propertyHash != null ? String(option.propertyHash).toLowerCase() : "";
      const id = normalizeText(option.id);
      const searchableText = [title, reference, hash, city, area, location, id].filter(Boolean).join(" ");
      let score = 0;

      if (title === normalizedQuery) score += 1000;
      if (title.startsWith(normalizedQuery)) score += 700;
      if (title.includes(normalizedQuery)) score += 500;

      const allTitleTokensFound = tokens.length > 0 && tokens.every((token) => title.includes(token));
      if (allTitleTokensFound) score += 350;

      tokens.forEach((token) => {
        if (title.includes(token)) score += 80;
        if (reference.includes(token) || hash.includes(token) || id.includes(token)) score += 120;
        if (city.includes(token) || area.includes(token) || location.includes(token)) score += 60;
        if (searchableText.includes(token)) score += 25;
      });

      return score;
    },
    [normalizeText, tokenizeQuery],
  );

  const displayedPropertyOptions = useMemo(() => {
    if (!normalizedPropertyQuery) return propertyOptions;
    const sorted = [...propertyOptions].sort((a, b) => {
      const scoreA = propertyMatchScore(a, normalizedPropertyQuery);
      const scoreB = propertyMatchScore(b, normalizedPropertyQuery);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.title.localeCompare(b.title);
    });
    const matches = sorted.filter((option) => propertyMatchScore(option, normalizedPropertyQuery) > 0);
    return matches.length > 0 ? matches : sorted;
  }, [normalizedPropertyQuery, propertyMatchScore, propertyOptions]);

  const mergeUniquePropertyOptions = useCallback(
    (base: LeadPropertySearchOption[], next: LeadPropertySearchOption[]): LeadPropertySearchOption[] => {
      const byId = new Map<string, LeadPropertySearchOption>();
      [...base, ...next].forEach((item) => {
        const key = item.id.trim() || String(item.propertyHash ?? "");
        if (!key) return;
        byId.set(key, item);
      });
      return [...byId.values()];
    },
    [],
  );

  const applyPropertyResult = useCallback(
    (result: LeadPropertySearchResult, page: number, append: boolean) => {
      setPropertyPage(page);
      setPropertyHasMore(result.hasMore);
      setPropertyOptions((prev) => {
        const nextItems = append ? mergeUniquePropertyOptions(prev, result.items) : result.items;
        setHighlightedIndex(nextItems.length > 0 ? 0 : -1);
        return nextItems;
      });
      setPropertyError(null);
    },
    [mergeUniquePropertyOptions],
  );

  const fetchPropertyPage = useCallback(
    async (query: string, page: number, append: boolean) => {
      const normalizedQuery = query.trim().toLowerCase();
      const key = `${normalizedQuery}|${page}`;
      const cached = propertyQueryCacheRef.current.get(key);
      if (cached) {
        applyPropertyResult(
          {
            items: cached.items,
            total: cached.items.length,
            page,
            pageSize: PROPERTY_PAGE_SIZE,
            hasMore: cached.hasMore,
          },
          page,
          append,
        );
        return;
      }
      if (propertyInFlightRef.current.has(key)) return;
      propertyInFlightRef.current.add(key);
      const requestId = ++latestPropertyRequestRef.current;
      if (append) {
        setPropertyLoadingMore(true);
      } else {
        setPropertyLoading(true);
        setPropertyLoadingMore(false);
      }
      try {
        const result = await searchLeadProperties({
          query,
          page,
          pageSize: PROPERTY_PAGE_SIZE,
        });
        if (requestId !== latestPropertyRequestRef.current) return;
        propertyQueryCacheRef.current.set(key, {
          items: result.items,
          hasMore: result.hasMore,
        });
        applyPropertyResult(result, page, append);
      } catch {
        if (requestId !== latestPropertyRequestRef.current) return;
        if (!append) setPropertyOptions([]);
        setPropertyError("Unable to load properties. You can still type property name manually.");
        setHighlightedIndex(-1);
      } finally {
        propertyInFlightRef.current.delete(key);
        if (requestId === latestPropertyRequestRef.current) {
          setPropertyLoading(false);
          setPropertyLoadingMore(false);
        }
      }
    },
    [applyPropertyResult],
  );

  useEffect(() => {
    if (!propertyInputFocused || selectedProperty) return;
    if (previousQueryRef.current !== normalizedPropertyQuery) {
      previousQueryRef.current = normalizedPropertyQuery;
      setPropertyPage(1);
      setPropertyHasMore(true);
      setPropertyOptions([]);
      setPropertyError(null);
      setHighlightedIndex(-1);
    }
    const timeout = window.setTimeout(() => {
      void fetchPropertyPage(normalizedPropertyQuery, 1, false);
    }, PROPERTY_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [fetchPropertyPage, normalizedPropertyQuery, propertyInputFocused, selectedProperty]);

  useEffect(() => {
    if (!normalizedPropertyQuery) return;
    if (propertyLoading || propertyLoadingMore) return;
    if (!propertyHasMore) return;
    if (propertyPage >= PROPERTY_AUTO_EXPAND_MAX_PAGES) return;
    const hasVisibleMatches = displayedPropertyOptions.some(
      (option) => propertyMatchScore(option, normalizedPropertyQuery) > 0,
    );
    if (hasVisibleMatches) return;
    void fetchPropertyPage(normalizedPropertyQuery, propertyPage + 1, true);
  }, [
    displayedPropertyOptions,
    fetchPropertyPage,
    normalizedPropertyQuery,
    propertyHasMore,
    propertyLoading,
    propertyLoadingMore,
    propertyMatchScore,
    propertyPage,
  ]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!propertyFieldRef.current) return;
      if (!propertyFieldRef.current.contains(event.target as Node)) {
        setPropertyInputFocused(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const isPropertyDropdownOpen = useMemo(() => {
    return propertyInputFocused && !selectedProperty;
  }, [propertyInputFocused, selectedProperty]);

  const selectProperty = useCallback((option: LeadPropertySearchOption) => {
    setSelectedProperty(option);
    setPropertySearchText(option.title);
    setPropertyError(null);
    setPropertyInputFocused(false);
    setHighlightedIndex(-1);
    setErrors((prev) => ({ ...prev, property: undefined }));
  }, []);

  const onPropertyKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!isPropertyDropdownOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        setPropertyInputFocused(true);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (displayedPropertyOptions.length === 0) return;
        setHighlightedIndex((prev) => {
          if (prev < 0) return 0;
          return prev >= displayedPropertyOptions.length - 1 ? 0 : prev + 1;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (displayedPropertyOptions.length === 0) return;
        setHighlightedIndex((prev) => {
          if (prev < 0) return displayedPropertyOptions.length - 1;
          return prev <= 0 ? displayedPropertyOptions.length - 1 : prev - 1;
        });
        return;
      }

      if (event.key === "Escape") {
        setPropertyInputFocused(false);
        setHighlightedIndex(-1);
        return;
      }

      if (event.key === "Tab") {
        setPropertyInputFocused(false);
        setHighlightedIndex(-1);
        return;
      }

      if (event.key === "Enter") {
        if (!isPropertyDropdownOpen) return;
        if (highlightedIndex >= 0 && highlightedIndex < displayedPropertyOptions.length) {
          event.preventDefault();
          selectProperty(displayedPropertyOptions[highlightedIndex]);
          return;
        }
        // Keep manual typed value as fallback property name.
        setPropertyInputFocused(false);
        setHighlightedIndex(-1);
      }
    },
    [displayedPropertyOptions, highlightedIndex, isPropertyDropdownOpen, selectProperty],
  );

  const onLoadMoreProperties = useCallback(() => {
    if (!propertyHasMore || propertyLoadingMore || propertyLoading) return;
    void fetchPropertyPage(normalizedPropertyQuery, propertyPage + 1, true);
  }, [fetchPropertyPage, normalizedPropertyQuery, propertyHasMore, propertyLoading, propertyLoadingMore, propertyPage]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const propertyName = selectedProperty?.title ?? propertySearchText.trim();
    const payload: OfflineLeadCreatePayload = {
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      inquiryType,
      source,
      ...(selectedProperty?.propertyId ? { propertyId: selectedProperty.propertyId } : {}),
      ...(propertyName ? { propertyName } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(mode === "admin" && assignedAgentId.trim() ? { assignedAgentId: assignedAgentId.trim() } : {}),
    };

    setSubmitting(true);
    try {
      await createOfflineLead(payload);
      onSuccessToast("Offline lead created successfully.");
      reset();
      onClose();
      await onSuccess();
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        onError("A lead already exists for this customer and property.");
      } else {
        onError(getApiErrorMessage(error, "Failed to create offline lead."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/45 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <DialogRoot open={open} onClose={handleClose} className="max-w-3xl overflow-visible" preventCloseOnOutsideClick={submitting}>
      <form noValidate onSubmit={(event) => void onSubmit(event)} className="space-y-4">
        <div>
          <h2 className="text-size-lg fw-semibold text-charcoal">Create Offline Lead</h2>
          <p className="mt-1 text-size-sm text-charcoal/65">
            Offline Lead Details for external communication tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="offline-customer-name" className="text-size-xs fw-medium text-charcoal/80">
              Customer Name <span className="text-red-600">*</span>
            </label>
            <input
              id="offline-customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={cn(inputClass, errors.customerName && "border-red-300")}
              placeholder="Customer name"
              disabled={submitting}
            />
            {errors.customerName ? <p className="text-sm text-red-600">{errors.customerName}</p> : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="offline-phone" className="text-size-xs fw-medium text-charcoal/80">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              id="offline-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={cn(inputClass, errors.phoneNumber && "border-red-300")}
              placeholder="Phone number"
              disabled={submitting}
            />
            {errors.phoneNumber ? <p className="text-sm text-red-600">{errors.phoneNumber}</p> : null}
          </div>

          <div className="order-1 space-y-1">
            <label htmlFor="offline-inquiry-type" className="text-size-xs fw-medium text-charcoal/80">
              Inquiry Type <span className="text-red-600">*</span>
            </label>
            <select
              id="offline-inquiry-type"
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value as OfflineLeadCreatePayload["inquiryType"])}
              className={inputClass}
              disabled={submitting}
            >
              {INQUIRY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="order-2 space-y-1">
            <label htmlFor="offline-source" className="text-size-xs fw-medium text-charcoal/80">
              Source <span className="text-red-600">*</span>
            </label>
            <select
              id="offline-source"
              value={source}
              onChange={(e) => setSource(e.target.value as OfflineLeadCreatePayload["source"])}
              className={inputClass}
              disabled={submitting}
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {getLeadSourceLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div ref={propertyFieldRef} className="order-3 space-y-1 relative md:col-span-2">
            <label htmlFor="offline-property" className="text-size-xs fw-medium text-charcoal/80">
              Property <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/45" />
              <input
                id="offline-property"
                value={propertySearchText}
                onChange={(e) => {
                  const next = e.target.value;
                  setPropertySearchText(next);
                  setPropertyInputFocused(true);
                  setPropertyError(null);
                  setHighlightedIndex(-1);
                  if (selectedProperty && next.trim() !== selectedProperty.title) {
                    setSelectedProperty(null);
                  }
                  if (errors.property) {
                    setErrors((prev) => ({ ...prev, property: undefined }));
                  }
                }}
                onFocus={() => setPropertyInputFocused(true)}
                onKeyDown={onPropertyKeyDown}
                className={cn(inputClass, "pl-9 pr-9", errors.property && "border-red-300")}
                placeholder="Search property by name, city, area, or reference"
                disabled={submitting}
                autoComplete="off"
              />
              {propertySearchText.trim() ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-charcoal/55 hover:bg-surface hover:text-charcoal"
                  onClick={() => {
                    setPropertySearchText("");
                    setSelectedProperty(null);
                    setPropertyOptions([]);
                    setPropertyPage(1);
                    setPropertyHasMore(false);
                    setPropertyError(null);
                    setHighlightedIndex(-1);
                    setPropertyInputFocused(true);
                  }}
                  aria-label="Clear property"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            {selectedProperty ? (
              <p className="text-xs text-primary inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                Selected: {selectedProperty.title}
                {selectedProperty.propertyHash != null ? ` #${selectedProperty.propertyHash}` : ""}
              </p>
            ) : null}
            {isPropertyDropdownOpen ? (
              <div className="absolute left-0 top-full z-[60] mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                {propertyLoading ? (
                  <div className="px-3 py-2 text-sm text-charcoal/65 inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading properties...
                  </div>
                ) : propertyError ? (
                  <div className="px-3 py-2 text-sm text-charcoal/65">{propertyError}</div>
                ) : displayedPropertyOptions.length > 0 ? (
                  <ul className="max-h-[240px] overflow-y-auto py-1">
                    {displayedPropertyOptions.map((option, index) => (
                      <li key={option.id}>
                        <button
                          type="button"
                          className={cn(
                            "w-full px-3 py-2 text-left hover:bg-slate-50",
                            highlightedIndex === index && "bg-blue-50/70",
                          )}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectProperty(option)}
                        >
                          <p className="truncate text-sm fw-medium text-charcoal">{option.title}</p>
                          <p className="truncate text-xs text-charcoal/60">
                            {option.referenceNumber ? `Ref ${option.referenceNumber}` : ""}
                            {option.referenceNumber && option.propertyHash != null ? " · " : ""}
                            {option.propertyHash != null ? `#${option.propertyHash}` : ""}
                            {(option.referenceNumber || option.propertyHash != null) && option.location ? " · " : ""}
                            {option.location ? option.location : ""}
                          </p>
                        </button>
                      </li>
                    ))}
                    {propertyHasMore && isTypedPropertySearch ? (
                      <li className="px-2 pt-1">
                        <button
                          type="button"
                          onClick={onLoadMoreProperties}
                          disabled={propertyLoadingMore}
                          className="mb-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-charcoal/75 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {propertyLoadingMore ? "Loading more..." : "Load more"}
                        </button>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-sm text-charcoal/65">
                    {isTypedPropertySearch
                      ? "No matching properties found. You can still use typed property name."
                      : "Suggested properties will appear here. You can also type to search."}
                  </div>
                )}
              </div>
            ) : null}
            {errors.property ? <p className="text-sm text-red-600">{errors.property}</p> : null}
          </div>

          {mode === "admin" ? (
            <div className="order-4 space-y-1">
              <label className="text-size-xs fw-medium text-charcoal/80" htmlFor="offline-assigned-agent">
                Assigned Agent <span className="text-red-600">*</span>
              </label>
              <Select
                value={assignedAgentId}
                onChange={(event) => setAssignedAgentId(event.target.value)}
                options={agentOptions}
                placeholder={agentsLoading ? "Loading agents..." : "Select an agent"}
                disabled={submitting || agentsLoading}
              />
              {errors.assignedAgentId ? <p className="text-sm text-red-600">{errors.assignedAgentId}</p> : null}
            </div>
          ) : null}

          <div className="order-5 space-y-1 md:col-span-2">
            <label htmlFor="offline-notes" className="text-size-xs fw-medium text-charcoal/80">
              Notes
            </label>
            <textarea
              id="offline-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(inputClass, "min-h-[120px] resize-y")}
              placeholder="Add context for this offline lead"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting} className="min-w-[10rem]">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Creating...
              </>
            ) : (
              "Create Offline Lead"
            )}
          </Button>
        </div>
      </form>
    </DialogRoot>
  );
}
