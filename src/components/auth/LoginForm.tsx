"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface LoginFormProps {
  nextPath: string;
}

interface AuthErrorResponse {
  error?: string;

  fieldErrors?: Record<
    string,
    string
  >;
}

export default function LoginForm({
  nextPath,
}: LoginFormProps) {
  const router = useRouter();

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<
    Record<string, string>
  >({});

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    setError(null);

    setFieldErrors({});

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            identifier,
            password,
          }),
        }
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | AuthErrorResponse
          | null;

      if (!response.ok) {
        setError(
          data?.error ??
            "Could not sign in"
        );

        setFieldErrors(
          data?.fieldErrors ?? {}
        );

        return;
      }

      router.replace(nextPath);

      router.refresh();
    } catch {
      setError(
        "Could not connect to the server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {error && (
        <p
          role="alert"
          className="
            rounded-lg
            border
            border-red-500/40
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-300
          "
        >
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor="identifier"
          className="
            block
            text-sm
            font-medium
            text-foreground-secondary
          "
        >
          Email or username
        </label>

        <Input
          id="identifier"
          name="identifier"
          type="text"
          value={identifier}
          onChange={(event) =>
            setIdentifier(
              event.target.value
            )
          }
          placeholder="you@email.com or your_username"
          autoComplete="username"
          autoFocus
          error={Boolean(
            fieldErrors.identifier
          )}
          aria-invalid={Boolean(
            fieldErrors.identifier
          )}
        />

        {fieldErrors.identifier && (
          <p className="text-xs text-red-400">
            {fieldErrors.identifier}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="
            block
            text-sm
            font-medium
            text-foreground-secondary
          "
        >
          Password
        </label>

        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          placeholder="••••••••"
          autoComplete="current-password"
          error={Boolean(
            fieldErrors.password
          )}
          aria-invalid={Boolean(
            fieldErrors.password
          )}
        />

        {fieldErrors.password && (
          <p className="text-xs text-red-400">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={loading}
      >
        {loading
          ? "Signing in..."
          : "Sign in"}
      </Button>

      <p
        className="
          text-center
          text-sm
          text-foreground-muted
        "
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="
            font-medium
            text-primary
            hover:text-primary-hover
          "
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
