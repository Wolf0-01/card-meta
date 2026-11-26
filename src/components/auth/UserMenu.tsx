"use client";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Button from "@/components/ui/Button";

import { USER_UPDATED_EVENT } from "@/lib/users/events";

interface CurrentUser {
  id: string;

  username: string;

  displayName: string | null;

  avatarUrl: string | null;

  role: "USER" | "EDITOR" | "ADMIN";
}

interface MeResponse {
  user: CurrentUser | null;
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await fetch(
      "/api/auth/me",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as MeResponse;

    return data.user ?? null;
  } catch {
    return null;
  }
}

const menuItemClasses = `
  flex
  w-full
  items-center
  gap-2
  rounded-lg
  px-2.5
  py-2
  text-left
  text-xs
  font-semibold
  text-slate-300
  transition-colors
  hover:bg-white/5
  hover:text-white
`;

/**
 * Avatar y menú desplegable del usuario autenticado, al
 * estilo de Duel Links Meta. Sin sesión muestra el botón de
 * Login habitual.
 */
export default function UserMenu() {
  const router = useRouter();

  const pathname = usePathname();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<
    CurrentUser | null | undefined
  >(undefined);

  const [open, setOpen] =
    useState(false);

  const [busy, setBusy] =
    useState(false);

  useEffect(() => {
    let active = true;

    void fetchCurrentUser().then((value) => {
      if (active) {
        setUser(value);
      }
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    function handleUserUpdated() {
      void fetchCurrentUser().then(setUser);
    }

    window.addEventListener(
      USER_UPDATED_EVENT,
      handleUserUpdated
    );

    return () => {
      window.removeEventListener(
        USER_UPDATED_EVENT,
        handleUserUpdated
      );
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  async function handleLogout() {
    setBusy(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setOpen(false);

      router.replace("/");

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (user === undefined) {
    return (
      <span
        aria-hidden
        className="
          h-9
          w-9
          animate-pulse
          rounded-full
          border
          border-border
          bg-surface
        "
      />
    );
  }

 if (user === null) {
    return (
      <Link
        href="/login"
        aria-label="Login"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background-secondary px-3 text-xs font-bold text-foreground transition-colors hover:border-primary/60 hover:text-primary"
      >
        <UserRound className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    );
  }

  const displayName =
    user.displayName?.trim() ||
    user.username;

  const initials = displayName
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        onClick={() => setOpen((value) => !value)}
        className="
          group
          flex
          items-center
          gap-1
          rounded-full
          border
          border-border
          bg-surface
          p-0.5
          transition-colors
          hover:border-primary/70
        "
      >
        <span
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            bg-background-secondary
            text-[10px]
            font-black
            text-foreground-secondary
          "
        >
          {user.avatarUrl ? (
            // El avatar puede ser una URL externa o un preset.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </span>

        <ChevronDown
          aria-hidden
          className={`
            mr-1
            h-3.5
            w-3.5
            text-foreground-muted
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="
            absolute
            right-0
            top-full
            z-[60]
            mt-2
            w-56
            overflow-hidden
            rounded-xl
            border
            border-slate-700/70
            bg-[#0B132B]
            p-1.5
            shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]
            ring-1
            ring-white/5
          "
        >
          <div className="border-b border-slate-800 px-2.5 pb-2 pt-1">
            <p className="truncate text-xs font-black text-white">
              {displayName}
            </p>

            <p className="truncate text-[10px] text-slate-500">
              @{user.username}
            </p>
          </div>

          <div className="mt-1 space-y-0.5">
            <Link
              href={`/user/${user.username}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={menuItemClasses}
            >
              <UserRound className="h-3.5 w-3.5" />
              Profile
            </Link>

            <Link
              href="/decks/mine"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={menuItemClasses}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              My Decks
            </Link>

            <Link
              href="/user/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={menuItemClasses}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className={menuItemClasses}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="mt-1 border-t border-slate-800 pt-1">
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              onClick={handleLogout}
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-lg
                bg-red-600/90
                px-2.5
                py-2
                text-left
                text-xs
                font-black
                text-white
                transition-colors
                hover:bg-red-500
                disabled:opacity-60
              "
            >
              <LogOut className="h-3.5 w-3.5" />
              {busy ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
