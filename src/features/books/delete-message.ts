const HIDDEN = "The book will be hidden from the StoryBook showcase.";

/**
 * Body of the delete confirmation (design E5). `purchaseCount` is the API's
 * `purchase_count`; until the backend sends it (docs/specs/backend-admin-extensions.md)
 * the general wording is used.
 */
export function deleteMessage(purchaseCount: number | undefined): string {
  if (purchaseCount === undefined) {
    return `${HIDDEN} Families who bought it keep access in My Book, and order history stays intact.`;
  }
  if (purchaseCount === 0) return `${HIDDEN} Nobody has bought it yet.`;
  const who =
    purchaseCount === 1
      ? "1 family who bought it keeps"
      : `${purchaseCount} families who bought it keep`;
  return `${HIDDEN} ${who} access in My Book, and order history stays intact.`;
}
