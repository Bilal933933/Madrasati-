"use client";

import { Button } from "@/components/ui/button";
import { getGoogleLoginUrl } from "../services/authApi";

export function GoogleLoginButton() {
  function handleClick() {
    // Redirect كامل للمتصفح — ليس طلب Fetch
    window.location.href = getGoogleLoginUrl();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      className="w-full"
    >
      المتابعة عبر جوجل
    </Button>
  );
}
