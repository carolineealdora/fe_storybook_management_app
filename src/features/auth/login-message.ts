import { ApiError } from "@/lib/types";

export function loginMessage(err: unknown) {
  if (!(err instanceof ApiError))
    return "We couldn't reach the server. Check your connection and try again.";
  switch (err.code) {
    case "INVALID_CREDENTIALS":
      return "Email or password is incorrect.";
    case "FORBIDDEN":
      return "This account can't use the back office. Admin accounts only.";
    case "VALIDATION_ERROR":
    case "SERVICE_UNAVAILABLE":
      return err.message;
    default:
      return "We couldn't sign you in. Please try again.";
  }
}
