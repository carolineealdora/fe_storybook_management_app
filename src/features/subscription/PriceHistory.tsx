import { formatDate, formatRupiah } from "@/lib/format";
import type { PriceChange } from "@/lib/types";

const th =
  "px-4 py-2.5 text-left font-mono text-xs font-semibold uppercase text-muted";
const td = "px-4 py-2.5";

export function PriceHistory({ changes }: { changes: PriceChange[] }) {
  // The column appears once the backend sends names (docs/specs/backend-admin-extensions.md).
  const hasNames = changes.some((c) => c.changed_by_name !== undefined);
  return (
    <section aria-labelledby="history-title" className="flex flex-col gap-2.5">
      <h2
        id="history-title"
        className="font-mono text-xs font-semibold text-muted uppercase"
      >
        Price history
      </h2>
      {changes.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-6 text-small text-muted">
          No price changes yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-100 text-sm">
            <thead className="border-b border-line bg-canvas">
              <tr>
                <th scope="col" className={th}>
                  Changed on
                </th>
                <th scope="col" className={th}>
                  Old price
                </th>
                <th scope="col" className={th}>
                  New price
                </th>
                {hasNames && (
                  <th scope="col" className={th}>
                    Changed by
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {changes.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-line-soft last:border-0"
                >
                  <td className={`${td} text-ink-2`}>
                    {formatDate(c.changed_at)}
                  </td>
                  <td className={`${td} font-mono text-muted`}>
                    {formatRupiah(c.old_price)}
                  </td>
                  <td className={`${td} font-mono`}>
                    {formatRupiah(c.new_price)}
                  </td>
                  {hasNames && (
                    <td className={`${td} text-ink-2`}>
                      {c.changed_by_name ?? "Former admin"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
