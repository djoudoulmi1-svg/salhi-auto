import { AdminLoginForm } from "@/components/admin-login-form";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ setup?: string; error?: string }> }) {
  const { setup, error } = await searchParams;
  return <AdminLoginForm setupRequired={setup === "required"} reason={error || ""} />;
}
