import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/components/login-form";

function LoginFormFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
