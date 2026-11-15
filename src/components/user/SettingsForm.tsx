"use client";

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

import {
  AVATAR_PRESETS,
  DEFAULT_CARD_SORTS,
} from "@/lib/users/avatarPresets";

import { notifyUserUpdated } from "@/lib/users/events";

interface SettingsUser {
  username: string;

  displayName: string | null;

  avatarUrl: string | null;

  defaultCardSort: string;

  role: "USER" | "EDITOR" | "ADMIN";
}

interface Props {
  user: SettingsUser;
}

interface SettingsResponse {
  error?: string;

  fieldErrors?: Record<string, string>;
}

const ROLE_BADGES: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  ADMIN: {
    label: "Admin",
    className:
      "border-amber-400/40 bg-amber-400/10 text-amber-200",
  },

  EDITOR: {
    label: "Editor",
    className:
      "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  },
};

export default function SettingsForm({
  user,
}: Props) {
  const router = useRouter();

  const [displayName, setDisplayName] =
    useState(user.displayName ?? "");

  const [avatarUrl, setAvatarUrl] =
    useState(user.avatarUrl ?? "");

  const [defaultCardSort, setDefaultCardSort] =
    useState(user.defaultCardSort);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  const previewName =
    displayName.trim() || user.username;

  const initials = previewName
    .slice(0, 2)
    .toUpperCase();

  const roleBadge = ROLE_BADGES[user.role];

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);

    setMessage(null);

    setError(null);

    setFieldErrors({});

    try {
      const response = await fetch(
        "/api/user/settings",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            displayName,
            avatarUrl,
            defaultCardSort,
          }),
        }
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | SettingsResponse
          | null;

      if (!response.ok) {
        setError(
          data?.error ??
            "Could not save your settings"
        );

        setFieldErrors(
          data?.fieldErrors ?? {}
        );

        return;
      }

      setMessage(
        "Settings saved successfully."
      );

      notifyUserUpdated();

      router.refresh();
    } catch {
      setError(
        "Could not connect to the server"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/");

      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      className="
        grid
        gap-5
        lg:grid-cols-[300px_minmax(0,1fr)]
        lg:items-start
      "
    >
      <aside
        className="
          rounded-2xl
          border
          border-border
          bg-background-secondary
          p-5
          lg:sticky
          lg:top-24
        "
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="
              flex
              h-24
              w-24
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-border
              bg-surface
              text-xl
              font-black
              text-foreground-secondary
              shadow-[0_0_30px_rgba(59,130,246,0.18)]
            "
          >
            {avatarUrl ? (
              // El avatar puede ser una URL externa o un preset.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={previewName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <p className="mt-3 text-lg font-black text-foreground">
            {previewName}
          </p>

          <p className="text-xs text-foreground-muted">
            @{user.username}
          </p>

          {roleBadge && (
            <span
              className={`
                mt-2
                inline-flex
                items-center
                rounded
                border
                px-2
                py-0.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.16em]
                ${roleBadge.className}
              `}
            >
              {roleBadge.label}
            </span>
          )}
        </div>

        <p
          className="
            mt-5
            border-t
            border-border
            pt-3
            text-center
            text-[10px]
            font-semibold
            text-foreground-muted
          "
        >
          This is how other players see you.
        </p>
      </aside>

      <section
        className="
          rounded-2xl
          border
          border-border
          bg-background-secondary
          p-5
        "
      >
        <header className="border-b border-border pb-3">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-primary
            "
          >
            Account
          </p>

          <h1 className="text-2xl font-black text-foreground">
            Settings
          </h1>

          <p className="mt-1 text-sm text-foreground-muted">
            Update your public profile and catalog
            preferences.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-5"
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

          {message && (
            <p
              role="status"
              className="
                rounded-lg
                border
                border-emerald-500/40
                bg-emerald-500/10
                px-4
                py-3
                text-sm
                text-emerald-300
              "
            >
              {message}
            </p>
          )}

          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="
                block
                text-sm
                font-medium
                text-foreground-secondary
              "
            >
              Display Name
            </label>

            <Input
              id="displayName"
              name="displayName"
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value
                )
              }
              placeholder={user.username}
              maxLength={40}
              error={Boolean(
                fieldErrors.displayName
              )}
            />

            {fieldErrors.displayName && (
              <p className="text-xs text-red-400">
                {fieldErrors.displayName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="avatarUrl"
              className="
                block
                text-sm
                font-medium
                text-foreground-secondary
              "
            >
              Avatar URL
            </label>

            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(event) =>
                setAvatarUrl(
                  event.target.value
                )
              }
              placeholder="https://..."
              error={Boolean(
                fieldErrors.avatarUrl
              )}
            />

            {fieldErrors.avatarUrl && (
              <p className="text-xs text-red-400">
                {fieldErrors.avatarUrl}
              </p>
            )}

            <div className="pt-1">
              <p
                className="
                  mb-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-foreground-muted
                "
              >
                Or pick a Yu-Gi-Oh! avatar
              </p>

              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map((preset) => {
                  const selected =
                    avatarUrl === preset.url;

                  return (
                    <button
                      key={preset.name}
                      type="button"
                      title={preset.name}
                      aria-label={`Use ${preset.name} as avatar`}
                      aria-pressed={selected}
                      onClick={() =>
                        setAvatarUrl(preset.url)
                      }
                      className={`
                        h-12
                        w-12
                        overflow-hidden
                        rounded-full
                        border-2
                        transition-all
                        ${
                          selected
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border hover:border-primary/70"
                        }
                      `}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="defaultCardSort"
              className="
                block
                text-sm
                font-medium
                text-foreground-secondary
              "
            >
              Default Card Sort
            </label>

            <select
              id="defaultCardSort"
              name="defaultCardSort"
              value={defaultCardSort}
              onChange={(event) =>
                setDefaultCardSort(
                  event.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-border
                bg-surface
                px-4
                py-2.5
                text-sm
                text-foreground
                outline-none
                transition-all
                duration-200
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            >
              {DEFAULT_CARD_SORTS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            {fieldErrors.defaultCardSort && (
              <p className="text-xs text-red-400">
                {
                  fieldErrors.defaultCardSort
                }
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>

            <Button
              type="button"
              variant="danger"
              disabled={loggingOut}
              onClick={handleLogout}
              className="gap-2"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
