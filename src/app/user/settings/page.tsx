import type { Metadata } from "next";

import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import SettingsForm from "@/components/user/SettingsForm";

import { getCurrentUser } from "@/lib/auth/currentUser";

export const metadata: Metadata = {
  title: "Settings | Card Meta",

  description:
    "Update your public profile, avatar and default card sort.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/user/settings");
  }

  return (
    <main className="min-h-screen py-8">
      <Container size="lg">
        <SettingsForm
          user={{
            username: user.username,

            displayName: user.displayName,

            avatarUrl: user.avatarUrl,

            defaultCardSort: user.defaultCardSort,

            role: user.role,
          }}
        />
      </Container>
    </main>
  );
}
