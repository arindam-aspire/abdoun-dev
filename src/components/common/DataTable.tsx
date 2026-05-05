 "use client";
 
 import type { ReactNode } from "react";
 import { X } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Dropdown } from "@/components/ui/dropdown";
 import { IconButton, Input } from "@/components/ui";
 import { CustomTable, type CustomTableProps } from "@/components/ui/CustomTable";
 
 export type DataTableSearchConfig = {
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   /** When true, shows a clear button while `value` is non-empty. */
   clearable?: boolean;
   clearAriaLabel?: string;
   inputClassName?: string;
 };
 
 export type DataTableFilterOption = { value: string; label: string };
 
 export type DataTableFilterConfig = {
   /** Stable key for rendering; not used for logic. */
   id: string;
   buttonId: string;
   value: string;
   onChange: (value: string) => void;
   options: DataTableFilterOption[];
   /** Shown on the dropdown button (e.g. "All"). */
   label?: string;
   align?: "left" | "right";
   menuClassName?: string;
   buttonClassName?: string;
 };
 
 export type DataTableProps<T> = {
   /** Left side header (icon + title) */
   headerLeft?: ReactNode;
   /** Optional content placed at far right of the header row. */
   headerRight?: ReactNode;
   /** If provided, renders a search input. */
   search?: DataTableSearchConfig;
   /** If provided, renders one or more dropdown filters. */
   filters?: DataTableFilterConfig[];
   /** Table props forwarded to `CustomTable`. */
   table: CustomTableProps<T>;
   className?: string;
 };
 
 export function DataTable<T>({
   headerLeft,
   headerRight,
   search,
   filters,
   table,
   className,
 }: DataTableProps<T>) {
   const hasControls = Boolean(search || (filters && filters.length > 0) || headerRight);
 
   return (
     <Card className={className ?? "rounded-xl border-subtle"}>
       {headerLeft || hasControls ? (
         <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
           <div className="flex items-center gap-2">
             {headerLeft ? <CardTitle className="text-size-sm text-charcoal">{headerLeft}</CardTitle> : null}
           </div>
 
           {hasControls ? (
             <div className="flex w-full justify-end md:w-auto">
               <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
                 {search ? (
                   <div className="w-full md:w-64 lg:w-80">
                     <Input
                       value={search.value}
                       onChange={(event) => search.onChange(event.target.value)}
                       placeholder={search.placeholder}
                       className={search.inputClassName ?? "h-10 w-full rounded-lg"}
                       rightAdornment={
                         search.clearable !== false && search.value.trim() ? (
                           <IconButton
                             type="button"
                             variant="ghost"
                             size="sm"
                             aria-label={search.clearAriaLabel ?? "Clear search"}
                             className="text-charcoal/55 hover:bg-charcoal/10 hover:text-charcoal"
                             onClick={() => search.onChange("")}
                           >
                             <X />
                           </IconButton>
                         ) : undefined
                       }
                     />
                   </div>
                 ) : null}
 
                 {filters?.map((f) => (
                   <div key={f.id} className="flex w-full items-center gap-2 md:w-auto">
                     <Dropdown
                       buttonId={f.buttonId}
                       label={f.label ?? "All"}
                       value={f.value}
                       onChange={(value) => f.onChange(String(value ?? ""))}
                       align={f.align ?? "right"}
                       menuClassName={f.menuClassName}
                       buttonClassName={
                         f.buttonClassName ??
                         "h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                       }
                       options={f.options}
                     />
                   </div>
                 ))}
 
                 {headerRight ? <div className="w-full md:w-auto">{headerRight}</div> : null}
               </div>
             </div>
           ) : null}
         </CardHeader>
       ) : null}
 
       <CardContent>
         <CustomTable {...table} />
       </CardContent>
     </Card>
   );
 }
 
