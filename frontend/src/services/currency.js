const PREFERENCE_KEY = "campusecom.preferredCurrency.v1";
const RATE_KEY = "campusecom.zmwPerUsd.v1";

export function readPreferredCurrency() {
  return window.localStorage.getItem(PREFERENCE_KEY) === "USD" ? "USD" : "ZMW";
}

export function writePreferredCurrency(currency) {
  if (!["ZMW", "USD"].includes(currency)) return false;
  window.localStorage.setItem(PREFERENCE_KEY, currency);
  window.dispatchEvent(new Event("campusecom:currency-change"));
  return true;
}

export function readZmwPerUsdRate() {
  const rate = Number(window.localStorage.getItem(RATE_KEY));
  return Number.isFinite(rate) && rate > 0 ? rate : 0;
}

export function writeZmwPerUsdRate(rate) {
  const value = Number(rate);
  if (!Number.isFinite(value) || value <= 0) return false;
  window.localStorage.setItem(RATE_KEY, String(value));
  return true;
}

export function formatMoney(amount, currency = readPreferredCurrency()) {
  const numericAmount = Number(amount) || 0;
  if (currency === "USD") {
    const rate = readZmwPerUsdRate();
    if (!rate) return `USD ${numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - rate not set`;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numericAmount / rate);
  }
  return new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW", currencyDisplay: "narrowSymbol" }).format(numericAmount);
}
