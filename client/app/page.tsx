import { AuthGuard } from "@/components/auth/auth-guard";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <AuthGuard>
      {/* Redirect authenticated users immediately to the photos application */}
      {redirect("/photos")}
    </AuthGuard>
  );
}