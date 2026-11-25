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

  const discordEnabled = Boolean(
    process.env.DISCORD_CLIENT_ID?.trim()
  );

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Regístrate para guardar y publicar tus mazos."
    >
      <RegisterForm discordEnabled={discordEnabled} />
    </AuthCard>
  );
}
