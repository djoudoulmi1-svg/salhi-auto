import Link from "next/link";

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: [string, string][] }) {
  return <main className="legal-page" dir="rtl"><header><Link className="brand" href="/"><span className="brand-mark">S</span><span>SALHI <b>AUTO</b><small>ورقلة · الجزائر</small></span></Link><Link href="/">العودة للموقع ←</Link></header><article><p className="eyebrow">SALHI AUTO · ورقلة</p><h1>{title}</h1><p className="legal-intro">{intro}</p><div className="legal-draft">النسخة الحالية معاينة للموقع. تُستكمل هذه الصفحة قبل الإطلاق بعد ربط النماذج وخدمات التحليل الفعلية.</div>{sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}</article><footer><Link href="/privacy">الخصوصية</Link><Link href="/terms">الشروط</Link><Link href="/cookies">ملفات الارتباط</Link></footer></main>;
}
