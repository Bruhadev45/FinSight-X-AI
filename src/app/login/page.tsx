"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to company login portal
    router.replace("/company/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to login portal...</p>
    </div>
  );
}