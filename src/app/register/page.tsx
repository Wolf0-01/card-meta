import { redirect } from "next/navigation";

import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

import { getCurrentUser } from "@/lib/auth/currentUser";

export default async function RegisterPage() {
  const user =
    await getCurrentUser();

  if (user) {
    redirect("/decks");
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Sign up to save and publish your decks."
    >
      <RegisterForm />
    </AuthCard>
  );
}
