// Shapes from ../storybook_management_app/docs/API-contracts.md (admin section).

export type BookStatus = "draft" | "published";
export type AgeType = "range" | "plus";

export interface AdminBook {
  id: string;
  title: string;
  author: string;
  description: string;
  age_type: AgeType;
  age_min: number;
  age_max: number | null;
  age_label: string;
  price: number;
  status: BookStatus;
  cover_url: string;
  epub_file_name: string;
  epub_size_bytes: number;
  /** Owners of the book. Proposed field: docs/specs/backend-admin-extensions.md. */
  purchase_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PriceChange {
  id: string;
  old_price: number;
  new_price: number;
  changed_by: string;
  /** Proposed field (null if the admin no longer exists). */
  changed_by_name?: string | null;
  changed_at: string;
}

export interface AdminPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  benefits: string;
  duration: string;
  updated_at: string;
  updated_by: string | null;
  price_history: PriceChange[];
  /** Proposed field: active, unexpired subscriptions. */
  active_subscriber_count?: number;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export const SERVICE_UNAVAILABLE_MESSAGE =
  "The server is unavailable. Please try again shortly.";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Unwraps `{ data }` or throws ApiError from `{ error }`. */
export async function readEnvelope<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => null);
  if (res.ok && body === null) return undefined as T; // 2xx with an empty body
  if (!res.ok) {
    const err = (body as ApiErrorBody | null)?.error;
    // A gateway error without the API's error body means the backend is unreachable.
    if (!err && [502, 503, 504].includes(res.status)) {
      throw new ApiError(
        res.status,
        "SERVICE_UNAVAILABLE",
        SERVICE_UNAVAILABLE_MESSAGE,
      );
    }
    throw new ApiError(
      res.status,
      err?.code ?? "GENERAL_ERROR",
      err?.message ?? "Something went wrong. Please try again.",
    );
  }
  return (body as { data: T }).data;
}
