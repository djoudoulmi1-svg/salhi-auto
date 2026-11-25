"use client";

import { useState } from "react";

const links = [
  ["الرئيسية", "#home"],
  ["السيارات", "#cars"],
  ["العلامات", "#brands"],
  ["عن المعرض", "#about"],
  ["الموقع", "#location"],
  ["تواصل معنا", "#contact"],
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return <>
    <button
      className="menu"
      type="button"
      aria-label={open ? "إغلاق القائمة" : "القائمة"}
      aria-expanded={open}
      aria-controls="mobile-navigation"
      onClick={() => setOpen((value) => !value)}
    >
      {open ? "×" : "☰"}
    </button>
    {open && <nav className="mobile-navigation" id="mobile-navigation" aria-label="التنقل الرئيسي">
      {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      <a href="/admin/login" onClick={() => setOpen(false)}>دخول الفريق</a>
    </nav>}
  </>;
}
