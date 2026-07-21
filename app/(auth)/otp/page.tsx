import { Suspense } from "react";
import { OtpForm } from "@/modules/auth/components/otp-form";

function OtpFormFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<OtpFormFallback />}>
      <OtpForm />
    </Suspense>
  );
}
