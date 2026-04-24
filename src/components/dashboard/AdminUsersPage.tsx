"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, LoadingScreen } from "@/components/ui";
import { Pagination } from "@/components/ui/Pagination";
import { Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: "user" | "agent" | "admin";
  joinDate: string;
  createdAt: string;
  status: "active" | "inactive";
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatPhoneForList(phone: string | null | undefined): string {
  if (!phone) return "N/A";
  const trimmed = phone.trim();
  if (!trimmed) return "N/A";
  return trimmed;
}

function rolePillClass(role: AdminUserRow["role"]): string {
  if (role === "admin") return "bg-purple-100 text-purple-800";
  if (role === "agent") return "bg-sky-100 text-sky-800";
  return "bg-zinc-100 text-zinc-800";
}

function statusPillClass(status: AdminUserRow["status"]): string {
  if (status === "active") return "bg-emerald-100 text-emerald-800";
  return "bg-rose-100 text-rose-800";
}

const MOCK_USERS: AdminUserRow[] = [
  {
    id: "user-001",
    fullName: "Ali Hasan",
    email: "ali.hasan@gmail.com",
    phone: "+962 779001001",
    role: "user",
    status: "active",
    joinDate: "2025-01-12T09:15:00.000Z",
    createdAt: "2025-01-12T09:15:00.000Z",
  },
  {
    id: "user-002",
    fullName: "Sara Khalid",
    email: "sara.khalid@hotmail.com",
    phone: "+962 779001002",
    role: "user",
    status: "active",
    joinDate: "2025-01-25T11:20:00.000Z",
    createdAt: "2025-01-25T11:20:00.000Z",
  },
  {
    id: "user-003",
    fullName: "Omar Nasser",
    email: "omar.nasser@yahoo.com",
    phone: "+962 779001003",
    role: "user",
    status: "inactive",
    joinDate: "2025-02-03T14:05:00.000Z",
    createdAt: "2025-02-03T14:05:00.000Z",
  },
  {
    id: "user-004",
    fullName: "Laila Ahmad",
    email: "laila.ahmad@gmail.com",
    phone: "+962 779001004",
    role: "user",
    status: "active",
    joinDate: "2025-02-18T08:40:00.000Z",
    createdAt: "2025-02-18T08:40:00.000Z",
  },
  {
    id: "user-005",
    fullName: "Hassan Youssef",
    email: "hassan.youssef@outlook.com",
    phone: "+962 779001005",
    role: "user",
    status: "active",
    joinDate: "2025-03-02T10:10:00.000Z",
    createdAt: "2025-03-02T10:10:00.000Z",
  },
  {
    id: "user-006",
    fullName: "Maya Rami",
    email: "maya.rami@gmail.com",
    phone: "+962 779001006",
    role: "user",
    status: "inactive",
    joinDate: "2025-03-15T16:25:00.000Z",
    createdAt: "2025-03-15T16:25:00.000Z",
  },
  {
    id: "user-007",
    fullName: "Yazan Hani",
    email: "yazan.hani@hotmail.com",
    phone: "+962 779001007",
    role: "user",
    status: "active",
    joinDate: "2025-03-28T13:45:00.000Z",
    createdAt: "2025-03-28T13:45:00.000Z",
  },
  {
    id: "user-008",
    fullName: "Rana Fares",
    email: "rana.fares@yahoo.com",
    phone: "+962 779001008",
    role: "user",
    status: "active",
    joinDate: "2025-04-06T09:00:00.000Z",
    createdAt: "2025-04-06T09:00:00.000Z",
  },
  {
    id: "user-009",
    fullName: "Khaled Jaber",
    email: "khaled.jaber@gmail.com",
    phone: "+962 779001009",
    role: "user",
    status: "inactive",
    joinDate: "2025-04-14T17:30:00.000Z",
    createdAt: "2025-04-14T17:30:00.000Z",
  },
  {
    id: "user-010",
    fullName: "Nour Saad",
    email: "nour.saad@outlook.com",
    phone: "+962 779001010",
    role: "user",
    status: "active",
    joinDate: "2025-04-27T12:10:00.000Z",
    createdAt: "2025-04-27T12:10:00.000Z",
  },
  {
    id: "user-011",
    fullName: "Tariq Salem",
    email: "tariq.salem@gmail.com",
    phone: "+962 779001011",
    role: "user",
    status: "active",
    joinDate: "2025-05-03T08:35:00.000Z",
    createdAt: "2025-05-03T08:35:00.000Z",
  },
  {
    id: "user-012",
    fullName: "Hiba Qasem",
    email: "hiba.qasem@hotmail.com",
    phone: "+962 779001012",
    role: "user",
    status: "inactive",
    joinDate: "2025-05-11T15:05:00.000Z",
    createdAt: "2025-05-11T15:05:00.000Z",
  },
  {
    id: "user-013",
    fullName: "Samir Rashed",
    email: "samir.rashed@yahoo.com",
    phone: "+962 779001013",
    role: "user",
    status: "active",
    joinDate: "2025-05-21T10:50:00.000Z",
    createdAt: "2025-05-21T10:50:00.000Z",
  },
  {
    id: "user-014",
    fullName: "Dina Odeh",
    email: "dina.odeh@gmail.com",
    phone: "+962 779001014",
    role: "user",
    status: "active",
    joinDate: "2025-06-02T09:25:00.000Z",
    createdAt: "2025-06-02T09:25:00.000Z",
  },
  {
    id: "user-015",
    fullName: "Mahmoud Issa",
    email: "mahmoud.issa@outlook.com",
    phone: "+962 779001015",
    role: "user",
    status: "inactive",
    joinDate: "2025-06-10T18:15:00.000Z",
    createdAt: "2025-06-10T18:15:00.000Z",
  },
  {
    id: "user-016",
    fullName: "Rania Ziad",
    email: "rania.ziad@gmail.com",
    phone: "+962 779001016",
    role: "user",
    status: "active",
    joinDate: "2025-06-19T11:40:00.000Z",
    createdAt: "2025-06-19T11:40:00.000Z",
  },
  {
    id: "user-017",
    fullName: "Fadi Imad",
    email: "fadi.imad@hotmail.com",
    phone: "+962 779001017",
    role: "user",
    status: "active",
    joinDate: "2025-07-01T08:05:00.000Z",
    createdAt: "2025-07-01T08:05:00.000Z",
  },
  {
    id: "user-018",
    fullName: "Leen Tariq",
    email: "leen.tariq@yahoo.com",
    phone: "+962 779001018",
    role: "user",
    status: "inactive",
    joinDate: "2025-07-09T16:55:00.000Z",
    createdAt: "2025-07-09T16:55:00.000Z",
  },
  {
    id: "user-019",
    fullName: "Ahmad Zaki",
    email: "ahmad.zaki@gmail.com",
    phone: "+962 779001019",
    role: "user",
    status: "active",
    joinDate: "2025-07-18T13:20:00.000Z",
    createdAt: "2025-07-18T13:20:00.000Z",
  },
  {
    id: "user-020",
    fullName: "Noor Ibrahim",
    email: "noor.ibrahim@outlook.com",
    phone: "+962 779001020",
    role: "user",
    status: "active",
    joinDate: "2025-07-29T09:50:00.000Z",
    createdAt: "2025-07-29T09:50:00.000Z",
  },
  {
    id: "user-021",
    fullName: "Ziad Kamal",
    email: "ziad.kamal@gmail.com",
    phone: "+962 779001021",
    role: "user",
    status: "inactive",
    joinDate: "2025-08-04T10:30:00.000Z",
    createdAt: "2025-08-04T10:30:00.000Z",
  },
  {
    id: "user-022",
    fullName: "Haneen Adel",
    email: "haneen.adel@hotmail.com",
    phone: "+962 779001022",
    role: "user",
    status: "active",
    joinDate: "2025-08-13T15:45:00.000Z",
    createdAt: "2025-08-13T15:45:00.000Z",
  },
  {
    id: "user-023",
    fullName: "Rashed Sami",
    email: "rashed.sami@yahoo.com",
    phone: "+962 779001023",
    role: "user",
    status: "active",
    joinDate: "2025-08-22T12:05:00.000Z",
    createdAt: "2025-08-22T12:05:00.000Z",
  },
  {
    id: "user-024",
    fullName: "Mona Adel",
    email: "mona.adel@gmail.com",
    phone: "+962 779001024",
    role: "user",
    status: "inactive",
    joinDate: "2025-09-01T09:10:00.000Z",
    createdAt: "2025-09-01T09:10:00.000Z",
  },
  {
    id: "user-025",
    fullName: "Yousef Karim",
    email: "yousef.karim@outlook.com",
    phone: "+962 779001025",
    role: "user",
    status: "active",
    joinDate: "2025-09-09T14:35:00.000Z",
    createdAt: "2025-09-09T14:35:00.000Z",
  },
  {
    id: "user-026",
    fullName: "Jana Sultan",
    email: "jana.sultan@gmail.com",
    phone: "+962 779001026",
    role: "user",
    status: "active",
    joinDate: "2025-09-19T18:00:00.000Z",
    createdAt: "2025-09-19T18:00:00.000Z",
  },
  {
    id: "user-027",
    fullName: "Bilal Fadi",
    email: "bilal.fadi@hotmail.com",
    phone: "+962 779001027",
    role: "user",
    status: "inactive",
    joinDate: "2025-10-03T08:45:00.000Z",
    createdAt: "2025-10-03T08:45:00.000Z",
  },
  {
    id: "user-028",
    fullName: "Nadia Hisham",
    email: "nadia.hisham@yahoo.com",
    phone: "+962 779001028",
    role: "user",
    status: "active",
    joinDate: "2026-03-05T11:55:00.000Z",
    createdAt: "2026-03-05T11:55:00.000Z",
  },
  {
    id: "user-029",
    fullName: "Karim Basel",
    email: "karim.basel@gmail.com",
    phone: "+962 779001029",
    role: "user",
    status: "active",
    joinDate: "2026-03-14T13:05:00.000Z",
    createdAt: "2026-03-14T13:05:00.000Z",
  },
  {
    id: "user-030",
    fullName: "Salma Majed",
    email: "salma.majed@outlook.com",
    phone: "+962 779001030",
    role: "user",
    status: "inactive",
    joinDate: "2026-03-22T17:20:00.000Z",
    createdAt: "2026-03-22T17:20:00.000Z",
  },
  {
    id: "user-031",
    fullName: "Amjad Hariri",
    email: "amjad.hariri@gmail.com",
    phone: "+962 779001031",
    role: "user",
    status: "active",
    joinDate: "2026-03-01T09:10:00.000Z",
    createdAt: "2026-03-01T09:10:00.000Z",
  },
  {
    id: "user-032",
    fullName: "Ruba Naim",
    email: "ruba.naim@hotmail.com",
    phone: "+962 779001032",
    role: "user",
    status: "active",
    joinDate: "2026-03-03T11:25:00.000Z",
    createdAt: "2026-03-03T11:25:00.000Z",
  },
  {
    id: "user-033",
    fullName: "Karam Suleiman",
    email: "karam.suleiman@yahoo.com",
    phone: "+962 779001033",
    role: "user",
    status: "inactive",
    joinDate: "2026-03-06T14:40:00.000Z",
    createdAt: "2026-03-06T14:40:00.000Z",
  },
  {
    id: "user-034",
    fullName: "Huda Mansour",
    email: "huda.mansour@gmail.com",
    phone: "+962 779001034",
    role: "user",
    status: "active",
    joinDate: "2026-03-08T10:05:00.000Z",
    createdAt: "2026-03-08T10:05:00.000Z",
  },
  {
    id: "user-035",
    fullName: "Othman Barakat",
    email: "othman.barakat@outlook.com",
    phone: "+962 779001035",
    role: "user",
    status: "active",
    joinDate: "2026-03-10T16:15:00.000Z",
    createdAt: "2026-03-10T16:15:00.000Z",
  },
  {
    id: "user-036",
    fullName: "Lina Shammout",
    email: "lina.shammout@gmail.com",
    phone: "+962 779001036",
    role: "user",
    status: "inactive",
    joinDate: "2026-03-12T09:45:00.000Z",
    createdAt: "2026-03-12T09:45:00.000Z",
  },
  {
    id: "user-037",
    fullName: "Nasser Tamimi",
    email: "nasser.tamimi@hotmail.com",
    phone: "+962 779001037",
    role: "user",
    status: "active",
    joinDate: "2026-03-15T13:30:00.000Z",
    createdAt: "2026-03-15T13:30:00.000Z",
  },
  {
    id: "user-038",
    fullName: "Farah Odeh",
    email: "farah.odeh@yahoo.com",
    phone: "+962 779001038",
    role: "user",
    status: "active",
    joinDate: "2026-03-17T08:20:00.000Z",
    createdAt: "2026-03-17T08:20:00.000Z",
  },
  {
    id: "user-039",
    fullName: "Sami Dabbas",
    email: "sami.dabbas@gmail.com",
    phone: "+962 779001039",
    role: "user",
    status: "inactive",
    joinDate: "2026-03-19T18:05:00.000Z",
    createdAt: "2026-03-19T18:05:00.000Z",
  },
  {
    id: "user-040",
    fullName: "Iman Khalaf",
    email: "iman.khalaf@outlook.com",
    phone: "+962 779001040",
    role: "user",
    status: "active",
    joinDate: "2026-03-21T12:50:00.000Z",
    createdAt: "2026-03-21T12:50:00.000Z",
  },
  {
    id: "user-041",
    fullName: "Murad Qaisi",
    email: "murad.qaisi@gmail.com",
    phone: "+962 779001041",
    role: "user",
    status: "active",
    joinDate: "2026-03-23T09:35:00.000Z",
    createdAt: "2026-03-23T09:35:00.000Z",
  },
  {
    id: "user-042",
    fullName: "Hala Nazzal",
    email: "hala.nazzal@hotmail.com",
    phone: "+962 779001042",
    role: "user",
    status: "inactive",
    joinDate: "2026-03-25T15:10:00.000Z",
    createdAt: "2026-03-25T15:10:00.000Z",
  },
  {
    id: "user-043",
    fullName: "Rami Saadeh",
    email: "rami.saadeh@yahoo.com",
    phone: "+962 779001043",
    role: "user",
    status: "active",
    joinDate: "2026-03-26T11:55:00.000Z",
    createdAt: "2026-03-26T11:55:00.000Z",
  },
  {
    id: "user-044",
    fullName: "Dalia Khoury",
    email: "dalia.khoury@gmail.com",
    phone: "+962 779001044",
    role: "user",
    status: "active",
    joinDate: "2026-03-28T10:40:00.000Z",
    createdAt: "2026-03-28T10:40:00.000Z",
  },
  {
    id: "user-045",
    fullName: "Zein Safadi",
    email: "zein.safadi@outlook.com",
    phone: "+962 779001045",
    role: "user",
    status: "inactive",
    joinDate: "2026-03-30T17:25:00.000Z",
    createdAt: "2026-03-30T17:25:00.000Z",
  },
];

export function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const PAGE_SIZE = 10;
  const PAGE_PARAM = "page";
  const MONTH_PARAM = "month";
  const STATUS_PARAM = "status";

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  const currentPage = useMemo(() => {
    const page = searchParams.get(PAGE_PARAM);
    const n = parseInt(page ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const filtered = useMemo(() => {
    const monthParam = searchParams.get(MONTH_PARAM);
    const statusParam = searchParams.get(STATUS_PARAM);

    let base = MOCK_USERS;

    if (monthParam) {
      base = base.filter((u) => u.joinDate.startsWith(monthParam));
    }

    if (statusParam === "active" || statusParam === "inactive") {
      base = base.filter((u) => u.status === statusParam);
    }

    const q = query.trim().toLowerCase();
    if (!q) return base;

    return base.filter((u) => {
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, searchParams]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const currentItems = filtered.slice(start, start + PAGE_SIZE);

  const onQueryChange = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set(PAGE_PARAM, "1");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const onMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(MONTH_PARAM, value);
    } else {
      params.delete(MONTH_PARAM);
    }
    params.set(PAGE_PARAM, "1");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const onStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "active" || value === "inactive") {
      params.set(STATUS_PARAM, value);
    } else {
      params.delete(STATUS_PARAM);
    }
    params.set(PAGE_PARAM, "1");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const selectedMonth = searchParams.get(MONTH_PARAM) ?? "";
  const selectedStatus = searchParams.get(STATUS_PARAM) ?? "";

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
            <CardTitle className="text-size-sm text-charcoal">User list</CardTitle>
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-64 lg:w-80">
                <Input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Search by name, email, phone"
                  className="h-10 w-full rounded-xl"
                />
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                <select
                  value={selectedMonth}
                  onChange={(event) => onMonthChange(event.target.value)}
                  className="h-10 rounded-xl border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">All months</option>
                  <option value="2025-01">Jan 2025</option>
                  <option value="2025-02">Feb 2025</option>
                  <option value="2025-03">Mar 2025</option>
                  <option value="2025-04">Apr 2025</option>
                  <option value="2025-05">May 2025</option>
                  <option value="2025-06">Jun 2025</option>
                  <option value="2025-07">Jul 2025</option>
                  <option value="2025-08">Aug 2025</option>
                  <option value="2025-09">Sep 2025</option>
                  <option value="2025-10">Oct 2025</option>
                  <option value="2026-03">Mar 2026</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(event) => onStatusChange(event.target.value)}
                  className="h-10 rounded-xl border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingScreen
              title="Loading users"
              description="Please wait while we load your users."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr className="border-b border-subtle text-size-xs text-charcoal/70">
                      <th className="px-2 py-2 fw-medium">Name</th>
                      <th className="px-2 py-2 fw-medium">Email</th>
                      <th className="px-2 py-2 fw-medium">Phone</th>
                      <th className="px-2 py-2 fw-medium">Role</th>
                      <th className="px-2 py-2 fw-medium">Status</th>
                      <th className="px-2 py-2 fw-medium">Created at</th>
                      <th className="px-2 py-2 fw-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-2 py-10 text-center text-size-sm text-charcoal/70"
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-subtle/70 text-size-sm last:border-0"
                        >
                          <td className="px-2 py-3 fw-semibold text-charcoal">
                            {u.fullName}
                          </td>
                          <td className="px-2 py-3 text-charcoal/80">{u.email}</td>
                          <td className="px-2 py-3 text-charcoal/80">
                            {formatPhoneForList(u.phone)}
                          </td>
                          <td className="px-2 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-size-11 fw-medium capitalize ${rolePillClass(u.role)}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-size-11 fw-medium capitalize ${statusPillClass(u.status)}`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-charcoal/70">
                            {formatDateTime(u.createdAt)}
                          </td>
                          <td className="px-2 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                className="rounded-full border border-charcoal/20 bg-surface px-3 py-1 text-size-11 fw-medium text-charcoal shadow-xs hover:bg-primary/5"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="rounded-full border border-secondary/40 bg-secondary px-3 py-1 text-size-11 fw-medium text-white shadow-xs hover:bg-secondary/90"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 border-t border-subtle pt-4">
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    pageParam={PAGE_PARAM}
                    translations={{
                      previous: "Previous",
                      next: "Next",
                      page: "Page",
                      of: "of",
                      showing: "Showing",
                      to: "to",
                      results: "users",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

