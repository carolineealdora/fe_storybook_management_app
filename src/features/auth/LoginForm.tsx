"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { apiRequest } from "@/lib/client-api";
import { ApiError } from "@/lib/types";
import { loginMessage } from "./login-message";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [badCredentials, setBadCredentials] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(undefined);
    try {
      await apiRequest("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      router.replace("/books");
      router.refresh();
    } catch (err) {
      setError(loginMessage(err));
      setBadCredentials(
        err instanceof ApiError && err.code === "INVALID_CREDENTIALS",
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4.5">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          invalid={badCredentials}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={badCredentials}
        />
      </Field>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={pending} className="h-10">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
