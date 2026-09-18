import { Suspense } from "react";
import { ActivateAccountForm } from "@/modules/auth/components/activate-account-form";

function ActivateAccountFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={<ActivateAccountFallback />}>
      <ActivateAccountForm />
    </Suspense>
  );
}
