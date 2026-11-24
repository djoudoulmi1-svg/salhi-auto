"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const storageKey = "salhi-auto-consent-v1";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => { setVisible(!localStorage.getItem(storageKey)); }, []);
  const save = (allowAnalytics: boolean) => {
    localStorage.setItem(storageKey, JSON.stringify({ necessary: true, analytics: allowAnalytics, consentedAt: new Date().toISOString(), policyVersion: "1" }));
    setVisible(false);
  };
  if (!visible) return null;
  return <aside className="consent-banner" role="dialog" aria-labelledby="consent-title" dir="rtl"><div><p className="eyebrow">خصوصيتك تهمنا</p><h2 id="consent-title">إعدادات ملفات الارتباط</h2><p>نستخدم الملفات الضرورية لتشغيل الموقع. ملفات التحليل اختيارية وتساعدنا على فهم استخدام الموقع. لن نفعّل التحليل إلا بموافقتك.</p><nav><Link href="/privacy">الخصوصية</Link><Link href="/cookies">ملفات الارتباط</Link><Link href="/terms">الشروط</Link></nav>{preferences && <label className="consent-choice"><span><b>الملفات الضرورية</b><small>لازمة لتشغيل الموقع ولا يمكن تعطيلها.</small></span><input type="checkbox" checked disabled aria-label="الملفات الضرورية إلزامية" /></label>}{preferences && <label className="consent-choice"><span><b>التحليلات</b><small>قياس استخدام الموقع، عند إعدادها.</small></span><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /></label>}</div><div className="consent-actions"><button onClick={() => save(false)}>رفض التحليل</button>{preferences ? <button className="gold-button" onClick={() => save(analytics)}>حفظ اختياراتي</button> : <><button onClick={() => setPreferences(true)}>تخصيص</button><button className="gold-button" onClick={() => save(true)}>قبول الكل</button></>}</div></aside>;
}
