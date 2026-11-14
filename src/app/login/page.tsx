import { redirect } from "next/navigation";

import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

import { getCurrentUser } from "@/lib/auth/currentUser";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

function safeNextPath(
  value: string | undefined
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/login")
  ) {
    return "/decks";
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const nextPath = safeNextPath(
    params.next
  );

  const user =
    await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Sign in to create and manage your decks."
    >
      <LoginForm
        nextPath={nextPath}
      />
    </AuthCard>
  );
}
