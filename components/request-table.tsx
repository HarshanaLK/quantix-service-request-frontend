import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceRequest } from "@/lib/types";
import { CATEGORY_LABELS, formatDate } from "@/lib/config";
import { EmptyState, PriorityBadge, StatusBadge } from "./ui";

export function RequestTable({ items }: { items: ServiceRequest[] }) {
  if (!items.length) return <EmptyState title="No requests found" description="Try changing your filters, or create a request if you are an employee." />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left">
    <thead><tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
      <th className="py-4 pl-5 pr-4">Request</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Priority</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Created</th><th className="px-4 py-4 text-right">View</th>
    </tr></thead>
    <tbody className="divide-y divide-slate-100">{items.map(item => <tr key={item.id} className="group transition hover:bg-slate-50/80">
      <td className="max-w-[300px] py-4 pl-5 pr-4"><Link href={`/requests/${item.id}`} className="block truncate text-sm font-bold text-ink group-hover:text-indigo-600" title={item.title}>{item.title}</Link><div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400"><span className="font-semibold">#{item.id}</span><span>•</span><span className="truncate">{item.employee?.name || "Employee"}</span></div></td>
      <td className="px-4 py-4 text-sm text-slate-600">{CATEGORY_LABELS[item.category]}</td>
      <td className="px-4 py-4"><PriorityBadge priority={item.priority}/></td>
      <td className="px-4 py-4"><StatusBadge status={item.status}/></td>
      <td className="px-4 py-4 text-xs text-slate-500">{formatDate(item.created_at)}</td>
      <td className="px-4 py-4 text-right"><Link aria-label={`View request ${item.id}`} href={`/requests/${item.id}`} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><ArrowUpRight className="h-4 w-4"/></Link></td>
    </tr>)}</tbody>
  </table></div>;
}
