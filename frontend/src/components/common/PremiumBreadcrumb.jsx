import { ChevronRight, House } from "lucide-react";
import { Link } from "react-router-dom";

export default function PremiumBreadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const isHome = index === 0 && item.label === "Home";

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && <ChevronRight aria-hidden="true" size={13} className="shrink-0 text-slate-300" />}
              {isCurrent ? (
                <span aria-current="page" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,.04)]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span className="truncate">{item.label}</span>
                </span>
              ) : (
                <Link to={item.to} className="group inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-medium text-slate-500 transition hover:bg-white hover:text-slate-900">
                  {isHome && <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-50 text-amber-700 transition group-hover:bg-amber-100"><House aria-hidden="true" size={12} strokeWidth={2.2} /></span>}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
