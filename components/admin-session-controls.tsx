"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export function IdleSignOut() {
  const router = useRouter();
  useEffect(() => {
    const key = "salhi-auto-admin-last-activity";
    const timeoutMs = 15 * 60 * 1000;
    let timer = 0;
    let signingOut = false;
    const schedule = () => {
      window.clearTimeout(timer);
      const last = Number(localStorage.getItem(key) || 0);
      const remaining = timeoutMs - (Date.now() - last);
      if (remaining <= 0 && !signingOut) {
        signingOut = true;
        void createClient().auth.signOut().finally(() => { localStorage.removeItem(key); router.replace("/admin/login?error=idle"); router.refresh(); });
      } else if (remaining > 0) timer = window.setTimeout(schedule, remaining + 25);
    };
    const recordActivity = () => { localStorage.setItem(key, String(Date.now())); schedule(); };
    const syncActivity = (event: StorageEvent) => { if (event.key === key) schedule(); };
    if (!localStorage.getItem(key)) localStorage.setItem(key, String(Date.now()));
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    window.addEventListener("storage", syncActivity);
    schedule();
    return () => { window.clearTimeout(timer); events.forEach((event) => window.removeEventListener(event, recordActivity)); window.removeEventListener("storage", syncActivity); };
  }, [router]);
  return null;
}

export function SignOutButton() {
  const router = useRouter();
  const signOut = async () => { await createClient().auth.signOut(); localStorage.removeItem("salhi-auto-admin-last-activity"); router.replace("/admin/login"); router.refresh(); };
  return <button onClick={signOut} aria-label="تسجيل الخروج" title="تسجيل الخروج">↪</button>;
}
