import { BrandLogo } from "@/components/brand-logo";
import { InteractiveCatalog } from "@/components/catalog";
import { HeroCarousel } from "@/components/hero-carousel";
import { getVehicles } from "@/lib/vehicles";
import { InquiryForm } from "@/components/inquiry-form";
import { getSiteSettings } from "@/lib/site-settings";
import { MobileMenu } from "@/components/mobile-menu";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return { title: settings.seoTitle, description: settings.seoDescription };
}

export default async function Home() {
  const [vehicles, settings] = await Promise.all([getVehicles({ availableOnly: true }), getSiteSettings()]);
  const brands = [...new Set(vehicles.map((vehicle) => vehicle.brand))];
  return <main>
    <header className="topbar"><a className="brand" href="#home"><BrandLogo /></a><nav><a href="#home">الرئيسية</a><a href="#cars">السيارات</a><a href="#brands">العلامات</a><a href="#about">عن المعرض</a><a href="#location">الموقع</a></nav><div className="header-actions"><a className="staff-login-button" href="/admin/login">دخول الفريق</a><a className="outline-button" href="#contact">تواصل معنا <span>↗</span></a><MobileMenu /></div></header>
    <section className="hero" id="home"><HeroCarousel cars={vehicles} /><div className="hero-shade"/><div className="hero-content"><p className="eyebrow gold">معرض صالحي أوتو <span>✦</span></p><h1>سيارتك القادمة<br/>تبدأ <em>من هنا.</em></h1><p className="hero-copy">سيارات جديدة ومستعملة من معرض Salhi Auto.<br/>تعرّف على السيارات المتاحة في ورقلة والجزائر.</p><div className="hero-buttons"><a className="gold-button" href="#cars">تصفّح السيارات <span>←</span></a><a className="play-link" href="#about">عن المعرض <span>↗</span></a></div><div className="hero-note"><span>✦</span> ورقلة · نخدم زبائننا في جميع أنحاء الجزائر</div></div><div className="hero-bottom"><span>ورقلة، الجزائر</span><span>استكشف المخزون <b>↓</b></span></div></section>
    <section className="trust-strip"><div><strong>01</strong><span>سيارات المعرض<br/><small>جديدة ومستعملة</small></span></div><div><strong>02</strong><span>معلومات واضحة<br/><small>تفاصيل السيارة وسعرها</small></span></div><div><strong>03</strong><span>تواصل مباشر<br/><small>الهاتف وواتساب</small></span></div><p>اختر سيارتك القادمة<br/><b>من Salhi Auto.</b></p></section>
    <section className="inventory section" id="cars"><div className="section-head"><div><p className="eyebrow">مخزون المعرض <span>✦</span></p><h2>السيارات <em>المتاحة.</em></h2><p className="muted">المعروض هنا هو المخزون المتاح لدى Salhi Auto فقط.</p></div><div className="catalog-header-actions"><span className="text-link">الأسعار بالدينار الجزائري</span><a className="text-link" href="/catalogue">دليل الطباعة / PDF ↗</a></div></div><InteractiveCatalog cars={vehicles} /></section>
    <section className="brands-section section" id="brands"><div className="section-head"><div><p className="eyebrow">تصفّح حسب العلامة</p><h2>العلامات <em>المتوفرة.</em></h2></div></div>{brands.length ? <div className="brand-list">{brands.map((brand) => <a href={`/#cars`} key={brand}>{brand}<span>←</span></a>)}</div> : <p className="muted">ستظهر العلامات التجارية هنا عند إضافة سيارات المعرض.</p>}</section>
    <section className="about section" id="about"><div className="about-pic"><div className="about-caption"><span>من ورقلة</span><b>لكل الجزائر.</b></div></div><div className="about-copy"><p className="eyebrow">عن المعرض <span>✦</span></p><h2>اختيارك يستحق<br/><em>اهتماماً خاصاً.</em></h2><p>{settings.about}</p><a className="text-link" href="#contact">تواصل مع Salhi Auto <span>←</span></a></div></section>
    <section className="location-band section" id="location"><div><p className="eyebrow">زوروا المعرض</p><h2>نستقبلكم في <em>ورقلة.</em></h2><p className="muted">{settings.address}</p></div><a className="outline-button dark-outline" href={settings.mapsUrl} target="_blank" rel="noreferrer">افتح الموقع على الخريطة ↗</a></section>
    <section className="contact-band contact-form-band" id="contact"><div><p className="eyebrow gold">تواصل مع المعرض <span>✦</span></p><h2>هل لديك سؤال عن سيارة؟</h2><p>أرسل طلباً للفريق أو تواصل مباشرة عبر الهاتف وواتساب.</p><div className="contact-actions"><a className="gold-button" href={`tel:${settings.phone.replace(/\D/g,"")}`}>اتصال: {settings.phone} <span>↗</span></a><a className="outline-button" href={`https://wa.me/213${settings.whatsapp.replace(/\D/g,"").replace(/^0/,"")}`} target="_blank" rel="noreferrer">WhatsApp {settings.whatsapp} <span>↗</span></a></div></div><InquiryForm /></section>
    <footer><a className="brand" href="#home"><BrandLogo /></a><nav className="legal-links"><a href="/privacy">الخصوصية</a><a href="/terms">الشروط</a><a href="/cookies">ملفات الارتباط</a></nav><nav className="social-links"><a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a><a href={settings.youtube} target="_blank" rel="noreferrer">YouTube</a><a href={settings.tiktok} target="_blank" rel="noreferrer">TikTok</a></nav><a href={`mailto:${settings.email}`}>{settings.email}</a><span>© {new Date().getFullYear()} SALHI AUTO. جميع الحقوق محفوظة.</span><a href="#home">العودة للأعلى ↑</a></footer>
  </main>;
}
