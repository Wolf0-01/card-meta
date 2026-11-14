import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { ShieldCheck } from "lucide-react";

import AdminSyncPanel from "@/components/admin/AdminSyncPanel";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { isAdmin } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Admin | Card Meta",

  description:
    "Card Meta catalog sync panel, exclusive to admins.",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!isAdmin(user)) {
    redirect("/");
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#070D1F]
        px-3
        py-5
        text-slate-100
        sm:px-6
        sm:py-7
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-4xl
          space-y-5
        "
      >
        <header className="space-y-2">
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.3em]
              text-amber-300
            "
          >
            Admin Console
          </p>

          <h1
            className="
              text-2xl
              font-black
              uppercase
              tracking-[0.14em]
              text-white
              sm:text-4xl
            "
          >
            Sync
          </h1>

          <p
            className="
              max-w-2xl
              text-[11px]
              leading-relaxed
              text-slate-400
            "
          >
            Run catalog maintenance tasks
            from the server. Banners marked with{" "}
            <code className="text-amber-200">#manual</code>{" "}
            are kept untouched.
          </p>

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-md
              border
              border-amber-400/30
              bg-amber-400/10
              px-2
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-amber-200
            "
          >
            <ShieldCheck className="h-3 w-3" />

            {user.displayName?.trim() ||
              user.username}{" "}
            · ADMIN
          </span>
        </header>

        <AdminSyncPanel />
      </div>
    </main>
  );
}
