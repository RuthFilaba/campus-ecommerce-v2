const REPORTS_KEY = "campusecom.previewListingReports.v1";

export function submitPreviewListingReport(productId, productName, reporterEmail, reason, details) {
  if (!String(reason || "").trim() || !String(details || "").trim()) return { error: "Choose a reason and explain the concern." };
  let reports = [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(REPORTS_KEY) || "[]");
    if (Array.isArray(stored)) reports = stored;
  } catch { reports = []; }
  const report = { id: `CE-LR-${Date.now().toString().slice(-7)}`, productId, productName, reporterEmail: reporterEmail || "Guest", reason, details: String(details).trim(), status: "submitted", createdAt: new Date().toISOString() };
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify([report, ...reports].slice(0, 100)));
  return { report };
}
