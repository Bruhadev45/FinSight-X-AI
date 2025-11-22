"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to company registration portal
    router.replace("/company/register");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to registration portal...</p>
    </div>
  );
}