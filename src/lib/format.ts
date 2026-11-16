const rupiah = new Intl.NumberFormat("id-ID");
const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

/** 49000 → "Rp 49.000" */
export const formatRupiah = (n: number) => `Rp ${rupiah.format(n)}`;

/** 0 → "Free", else "Rp 32.000" */
export const formatBookPrice = (n: number) =>
  n === 0 ? "Free" : formatRupiah(n);

/** RFC 3339 → "16 Nov 2026" */
export const formatDate = (iso: string) => date.format(new Date(iso));

export function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
