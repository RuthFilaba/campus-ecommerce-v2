export function getOrderStatusTone(status) {
  const value = String(status || "").toLowerCase();
  if (/cancel|refund|reject|fail|disput/.test(value)) return "bg-rose-50 text-rose-700";
  if (/deliver|complete|received|verified|resolved/.test(value)) return "bg-emerald-50 text-emerald-800";
  if (/pending|confirm|process|ship|ready|pickup|await/.test(value)) return "bg-blue-50 text-blue-800";
  return "bg-slate-100 text-slate-700";
}
