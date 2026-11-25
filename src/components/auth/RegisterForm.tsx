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

import DiscordButton from "@/components/auth/DiscordButton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface AuthErrorResponse {
  error?: string;

  fieldErrors?: Record<
    string,
    string
  >;
}

const initialValues = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterForm({
  discordEnabled = false,
}: {
  discordEnabled?: boolean;
}) {
  const router = useRouter();

  const [values, setValues] =
    useState(initialValues);

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

  function updateField(
    key: keyof typeof initialValues,
    value: string
  ) {
    setValues((previous) => ({
      ...previous,

      [key]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    setError(null);

    setFieldErrors({});

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(values),
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
            "No se pudo crear la cuenta"
        );

        setFieldErrors(
          data?.fieldErrors ?? {}
        );

        return;
      }

      router.replace("/decks");

      router.refresh();
    } catch {
      setError(
        "No se pudo conectar con el servidor"
      );
    } finally {
      setLoading(false);
    }
  }

  function fieldError(
    key: keyof typeof initialValues
  ) {
    return fieldErrors[key];
  }

  return (
    <div className="space-y-5">
      {discordEnabled && (
        <>
          <DiscordButton />

          <div className="relative flex items-center justify-center">
            <span className="h-px w-full bg-border" />
            <span className="bg-surface px-3 text-xs font-medium uppercase tracking-wider text-foreground-muted">
              o
            </span>
            <span className="h-px w-full bg-border" />
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Nombre{" "}
            <span className="text-foreground-muted">
              (opcional)
            </span>
          </label>

          <Input
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value
              )
            }
            placeholder="Tu nombre"
            autoComplete="name"
            error={Boolean(
              fieldError("name")
            )}
          />

          {fieldError("name") && (
            <p className="text-xs text-red-400">
              {fieldError("name")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Nombre de usuario
          </label>

          <Input
            id="username"
            name="username"
            type="text"
            value={values.username}
            onChange={(event) =>
              updateField(
                "username",
                event.target.value
              )
            }
            placeholder="dark_magician"
            autoComplete="username"
            autoFocus
            error={Boolean(
              fieldError("username")
            )}
            aria-invalid={Boolean(
              fieldError("username")
            )}
          />

          {fieldError("username") ? (
            <p className="text-xs text-red-400">
              {fieldError("username")}
            </p>
          ) : (
            <p className="text-xs text-foreground-muted">
              3–24 caracteres: letras, números, guiones y guiones bajos.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Correo electrónico
          </label>

          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value
              )
            }
            placeholder="tu@correo.com"
            autoComplete="email"
            error={Boolean(
              fieldError("email")
            )}
            aria-invalid={Boolean(
              fieldError("email")
            )}
          />

          {fieldError("email") && (
            <p className="text-xs text-red-400">
              {fieldError("email")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Contraseña
          </label>

          <Input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={(event) =>
              updateField(
                "password",
                event.target.value
              )
            }
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={Boolean(
              fieldError("password")
            )}
            aria-invalid={Boolean(
              fieldError("password")
            )}
          />

          {fieldError("password") && (
            <p className="text-xs text-red-400">
              {fieldError("password")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Repetir contraseña
          </label>

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={(event) =>
              updateField(
                "confirmPassword",
                event.target.value
              )
            }
            placeholder="••••••••"
            autoComplete="new-password"
            error={Boolean(
              fieldError("confirmPassword")
            )}
            aria-invalid={Boolean(
              fieldError("confirmPassword")
            )}
          />

          {fieldError("confirmPassword") && (
            <p className="text-xs text-red-400">
              {fieldError("confirmPassword")}
            </p>
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={loading}
        >
          {loading
            ? "Creando cuenta..."
            : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm text-foreground-muted">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
