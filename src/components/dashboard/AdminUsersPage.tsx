"use client";

import { AdminUserActionsMenu } from "@/components/dashboard/AdminUserActionsMenu";
import { CountryFlagImg } from "@/components/ui/phone-country-code-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CustomTable,
  Dropdown,
  IconButton,
  Input,
  Skeleton,
  sortRowsByConfig,
  Toast,
  type CustomTableColumn,
  type SortConfig,
} from "@/components/ui";
import {
  DEFAULT_PAGINATION_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
} from "@/components/ui/Pagination";
import { fetchAdminUsers } from "@/features/admin-users/adminUsersSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { getProfilePhoneReadonlyDisplay } from "@/lib/phone";
import type { UserManagementUser } from "@/services/userService";
import { Users, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function UserPhoneTableCell({
  phone,
}: {
  phone: string | null | undefined;
}): React.ReactNode {
  if (!phone?.trim()) return "—";
  const trimmed = phone.trim();
  const withoutPlus = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
  if (withoutPlus.startsWith("0")) return "—";
  const parts = getProfilePhoneReadonlyDisplay(trimmed);
  if (!parts) return trimmed;
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2 tabular-nums">
      <CountryFlagImg
        iso2={parts.iso2}
        className="h-4 w-5 shrink-0"
        title={parts.iso2}
      />
      <span className="min-w-0 truncate">{parts.nationalLine}</span>
    </span>
  );
}

function statusPillClass(isActive: boolean): string {
  return isActive
    ? "bg-emerald-100 text-emerald-800"
    : "bg-rose-100 text-rose-800";
}

const TABLE_SKELETON_ROWS = 6;

function AdminUsersTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: TABLE_SKELETON_ROWS }, (_, i) => (
        <tr key={i} className="border-b border-subtle/70 last:border-b-0">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-36 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-40 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-6 w-20 max-w-full rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28 max-w-full" />
          </td>
          <td className="px-4 py-3 text-right">
            <Skeleton className="ml-auto h-8 w-8 max-w-full rounded-md" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rows = useAppSelector((s) => s.adminUsers.items);
  const loading = useAppSelector((s) => s.adminUsers.loading);
  const error = useAppSelector((s) => s.adminUsers.error);
  const hasNextPage = useAppSelector((s) => s.adminUsers.hasNextPage);
  const listTotal = useAppSelector((s) => s.adminUsers.listTotal);

  const PAGE_PARAM = "page";
  const PAGE_SIZE_PARAM = "pageSize";

  /** Search and status are local only — not written to the URL. */
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    "",
  );
  /** Period is local-only — sent to API but not written to the URL. */
  const [periodFilter, setPeriodFilter] = useState<"" | "weekly" | "monthly" | "yearly">("");
  const [toast, setToast] = useState<{
    kind: "info" | "error" | "success";
    message: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { id: "createdAt", direction: "desc" },
  ]);

  const pageSize = useMemo(() => {
    const raw = searchParams.get(PAGE_SIZE_PARAM);
    const n = Number.parseInt(raw ?? String(DEFAULT_PAGINATION_PAGE_SIZE), 10);
    return PAGINATION_PAGE_SIZES.includes(
      n as (typeof PAGINATION_PAGE_SIZES)[number],
    )
      ? n
      : DEFAULT_PAGINATION_PAGE_SIZE;
  }, [searchParams]);

  const currentPage = useMemo(() => {
    const page = searchParams.get(PAGE_PARAM);
    const n = Number.parseInt(page ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const statusFilterForApi = useMemo(() => {
    if (statusFilter === "active") return true;
    if (statusFilter === "inactive") return false;
    return undefined;
  }, [statusFilter]);

  /** One-time: read legacy params into state, then remove them from the URL. */
  useLayoutEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const legacyQ = params.get("q");
    const legacyStatus = params.get("status");
    const legacyPeriod = params.get("period") ?? params.get("limit");
    if (legacyQ) setQuery(legacyQ);
    if (legacyStatus === "active" || legacyStatus === "inactive") {
      setStatusFilter(legacyStatus);
    }
    if (legacyPeriod === "weekly" || legacyPeriod === "monthly" || legacyPeriod === "yearly") {
      setPeriodFilter(legacyPeriod);
    }
    if (
      !params.has("q") &&
      !params.has("status") &&
      !params.has("limit") &&
      !params.has("period")
    ) {
      return;
    }
    params.delete("q");
    params.delete("status");
    params.delete("limit");
    params.delete("period");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate legacy `q`/`status` once on mount
  }, []);

  const resetToFirstPageIfNeeded = () => {
    if (currentPage <= 1) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("status");
    params.delete(PAGE_PARAM);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  useEffect(() => {
    void dispatch(
      fetchAdminUsers({
        page: currentPage,
        pageSize,
        search: query.trim() || undefined,
        is_active: statusFilterForApi,
        period: periodFilter
          ? (periodFilter as "weekly" | "monthly" | "yearly")
          : undefined,
      }),
    );
  }, [dispatch, currentPage, pageSize, query, statusFilterForApi, periodFilter]);

  const totalItems = useMemo(() => {
    if (listTotal != null && Number.isFinite(listTotal)) return listTotal;
    if (!hasNextPage && !loading && !error)
      return (currentPage - 1) * pageSize + rows.length;
    return undefined;
  }, [
    listTotal,
    hasNextPage,
    loading,
    error,
    currentPage,
    pageSize,
    rows.length,
  ]);

  const totalPages = useMemo(() => {
    if (typeof totalItems === "number" && Number.isFinite(totalItems)) {
      return Math.max(1, Math.ceil(totalItems / pageSize));
    }
    return Math.max(1, hasNextPage ? currentPage + 1 : currentPage);
  }, [totalItems, pageSize, hasNextPage, currentPage]);

  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (loading || error) return;
    if (currentPage > 1 && rows.length === 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(PAGE_PARAM, "1");
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }
  }, [
    loading,
    error,
    currentPage,
    rows.length,
    router,
    pathname,
    searchParams,
  ]);

  const onSearchChange = (value: string) => {
    setQuery(value);
    resetToFirstPageIfNeeded();
  };

  const onStatusChange = (value: string) => {
    setStatusFilter(value === "active" || value === "inactive" ? value : "");
    resetToFirstPageIfNeeded();
  };

  const onPeriodChange = (value: string) => {
    const next =
      value === "weekly" || value === "monthly" || value === "yearly" ? value : "";
    setPeriodFilter(next);
  };

  const tableRows = useMemo(
    () =>
      sortRowsByConfig(
        Array.isArray(rows) ? rows : [],
        sortConfig,
        (row, columnId) => {
          switch (columnId) {
            case "fullName":
              return row.full_name ?? "";
            case "email":
              return row.email ?? "";
            case "phone":
              return row.phone_number ?? "";
            case "status":
              return row.is_active ? 1 : 0;
            case "createdAt":
              return row.created_at ? Date.parse(row.created_at) : 0;
            default:
              return "";
          }
        },
      ),
    [rows, sortConfig],
  );

  const userColumns: CustomTableColumn<UserManagementUser>[] = useMemo(
    () => [
      {
        id: "fullName",
        header: "Name",
        sortable: true,
        getSortValue: (row) => row.full_name ?? "",
        cellClassName: "fw-medium text-charcoal",
        render: (u) => u.full_name?.trim() || "—",
      },
      {
        id: "email",
        header: "Email",
        sortable: true,
        getSortValue: (row) => row.email ?? "",
        cellClassName: "text-charcoal/80",
        render: (u) => u.email ?? "—",
      },
      {
        id: "phone",
        header: "Phone",
        sortable: true,
        getSortValue: (row) => row.phone_number ?? "",
        cellClassName: "text-charcoal/80",
        render: (u) => <UserPhoneTableCell phone={u.phone_number} />,
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        getSortValue: (row) => (row.is_active ? "active" : "inactive"),
        render: (u) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-size-11 fw-medium capitalize ${statusPillClass(u.is_active)}`}
          >
            {u.is_active ? "active" : "inactive"}
          </span>
        ),
      },
      {
        id: "createdAt",
        header: "Created at",
        sortable: true,
        getSortValue: (row) => row.created_at ?? "",
        cellClassName: "text-charcoal/80",
        render: (u) => (u.created_at ? formatDateTime(u.created_at) : "—"),
      },
      {
        id: "actions",
        header: <span className="block text-right">Actions</span>,
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (u) => (
          <AdminUserActionsMenu user={u} onToast={(t) => setToast(t)} />
        ),
      },
    ],
    [],
  );

  const emptyListMessage = useMemo(() => {
    if (query.trim()) {
      return "No users match your search. Try a different name, email, or phone.";
    }
    if (statusFilter === "active" || statusFilter === "inactive") {
      return "No users with this status. Clear the status filter to see everyone.";
    }
    return "No users to show.";
  }, [query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 px-1 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Users
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            Review and manage platform users.
          </p>
        </div>
      </div>

      <Card className="rounded-xl border-subtle">
        <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">
              User list
            </CardTitle>
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-64 lg:w-80">
                <Input
                  value={query}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search by name, email, phone"
                  className="h-10 w-full rounded-lg"
                  rightAdornment={
                    query.trim() ? (
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Clear search"
                        className="text-charcoal/55 hover:bg-charcoal/10 hover:text-charcoal"
                        onClick={() => onSearchChange("")}
                      >
                        <X />
                      </IconButton>
                    ) : undefined
                  }
                />
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                <Dropdown
                  buttonId="admin-users-status-filter"
                  label="All"
                  value={statusFilter}
                  onChange={(val) => onStatusChange(val)}
                  align="right"
                  menuClassName="w-44"
                  buttonClassName="h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                  options={[
                    { value: "", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <Dropdown
                  buttonId="admin-users-period-filter"
                  label="All"
                  value={periodFilter}
                  onChange={(val) => onPeriodChange(val)}
                  align="right"
                  menuClassName="w-44"
                  buttonClassName="h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                  options={[
                    { value: "", label: "All" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable<UserManagementUser>
            columns={userColumns}
            data={tableRows}
            getRowId={(row) => row.id}
            sortConfig={sortConfig}
            onSort={setSortConfig}
            multiSortWithShift
            loading={loading}
            skeleton={<AdminUsersTableSkeleton />}
            error={error}
            errorTitle="Something went wrong while loading users."
            emptyMessage={emptyListMessage}
            minTableWidth="900px"
            pagination={{
              showWhen:
                !loading && !error && totalPages > 1 && tableRows.length > 0,
              currentPage: safePage,
              totalPages,
              totalItems,
              pageSize,
              pageParam: PAGE_PARAM,
              pageSizeParam: PAGE_SIZE_PARAM,
              translations: {
                previous: "Previous",
                next: "Next",
                page: "Page",
                of: "of",
                showing: "Showing",
                to: "to",
                results: "users",
              },
            }}
          />
        </CardContent>
      </Card>

      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
