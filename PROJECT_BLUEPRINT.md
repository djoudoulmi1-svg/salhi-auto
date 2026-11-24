# Salhi Auto — Implementation Blueprint

## Product and visual direction

- Official showroom website for Salhi Auto in Ouargla, serving customers across Algeria with emphasis on Ouargla and nearby areas.
- Only dealership-owned or dealership-offered vehicles are listed; no public “sell your car” submissions.
- Premium black and gold identity for the public site. Admin uses black, grey and silver.
- Arabic is required; French and English are optional per vehicle/page. Admin is available in Arabic, French and English.
- Currency is Algerian dinar (DZD) only. Owner may show or hide a vehicle price and change that setting at any time.
- Responsive layout, four vehicle cards per row on large screens, two on tablets, and one or two on phones.

## Public website

- Homepage includes a vehicle hero slider (five seconds per slide, horizontal transition, arrows, dots and a discover action), trust highlights, featured/recent vehicles, a manageable brand grid, showroom introduction, contact details and Google Maps.
- Vehicle catalogue supports brand, price, year range, fuel and transmission filters; text search covers brand/model/year without autocomplete. Desktop filters update immediately; phone users apply them with a results action. Price uses paired bounds and a synchronized range control.
- Pagination defaults to 12 vehicles and is configurable by the admin. Filters persist when changing pages. Sort order can be set flexibly; featured vehicles may be automatic or manually pinned.
- Public listings show available vehicles only. Reserved and sold vehicles are hidden. Direct links to unavailable vehicles show an unavailable notice. Admin retains sold records.
- Vehicle records support new/used condition, year, mileage, engine, fuel, transmission, color, features/options, multilingual description, unlimited images, featured state, optional hidden price and per-vehicle discounts. Images upload from phone or computer, compress to WebP, can be reordered by drag/drop, and the first image is primary. Confirm before deleting an image.
- Vehicle detail page: large primary photo plus thumbnails (no full-screen gallery), essential-spec cards, full specification table, four similar vehicles, contact actions and a vehicle-specific inquiry form. Include share links (WhatsApp, Facebook, copy link), a branded individual PDF with QR code, and an on-demand customizable stock catalogue PDF.
- Comparison is limited to two vehicles; users can use a bottom comparison bar and a separate comparison page. Favorites require no account, persist in the browser, have a dedicated page, and automatically exclude vehicles once unavailable. No price-drop alerts.
- Contact/inquiry fields: required customer name, phone and Algerian wilaya; vehicle preselected; message optional. On submission, show a success message and reference code. A public reference page shows inquiry status and last update. Add adaptive CAPTCHA for suspicious activity.
- No testimonials section and no separate promotions page. Discounts are managed per vehicle.
- Create three legal pages. Use essential and analytics cookies with a required consent choice recorded for audit. Analytics combine internal database statistics and Google Analytics 4.

## Admin and operations

- Full three-language admin dashboard with balanced KPIs, flexible translated side navigation, responsive table/card switch for inquiries, and newest-first bell plus toast notifications with important alerts highlighted.
- Username/password admin sign-in; no employee email is requested or used. The owner sets usernames and passwords, can create manager/employee accounts, reset passwords, and suspend accounts. Supabase Auth stores password hashes, uses an internal non-deliverable `.invalid` address, and never sends mail for login. Expire sessions after 15 minutes idle. Roles start with owner, manager and employee defaults, and owner may customize individual employee permissions.
- Vehicle creation is a multi-step wizard. Editing uses the same steps. All required steps must be complete before publishing; publish is immediate. Brands/models/colors use managed lists with defaults and admin additions; fuel and transmission use fixed lists; options and year are entered manually.
- Inquiry tracking includes new/contacted/closed states, last-updated timestamps, assigned employee name, shared visibility for all staff, and a contact history. Staff may edit/delete their own notes; owner and manager may manage all notes. Archive inquiries for three months.
- Notify the admin dashboard, WhatsApp and email when an inquiry arrives. Log important actions for three months; ask once before permanent deletion. Back up weekly; restore through the developer. Check availability every 15 minutes and include robust error monitoring, security hardening, performance work and editable automatic SEO.

## Technology and launch

- Next.js + Tailwind CSS, Supabase (Auth, Postgres and Storage), deployed on Vercel.
- Enforce least privilege with Supabase RLS; never expose service-role secrets in the browser.
- Public SEO includes editable titles/descriptions and multilingual metadata. GA4 and consent state are configurable.

## Confirmed now / defaults

- Floating contact control: option C is recommended and remains pending explicit selection: a WhatsApp button opens WhatsApp and phone choices.
- The original discussion selected “C” for several alternatives, but no option identifier is saved for question 161, so it is not treated as a user decision.
- Defaults used for the first pass: 12 vehicles per page, automatic catalogue PDF generation on request, weekly backups, 15-minute idle expiry and availability check, three-month inquiry archive/audit retention.

## Inputs still needed

- Real vehicle inventory and approved showroom logo.
- Email sender details and analytics measurement ID if those features are enabled.
- Floating contact control choice (question 161 remains unanswered); option C is recommended but not selected.

## Implementation status

- Next.js + Tailwind + Supabase + Vercel stack is configured. Public inventory reads from Supabase and displays only available vehicles; no sample cars or demo figures are used.
- Owner/manager inventory tools create and publish cars, upload compressed photos, manage status, and confirm permanent deletion. Vehicle details, favorites, comparison, filters, contact links, legal pages, and responsive Arabic homepage use live inventory.
- Remaining blueprint work includes customer inquiry submissions/tracking and notifications, full admin translation and permission controls, brand management, audit/backup automation, analytics, editable SEO and branded catalogue PDFs.
- Floating contact buttons remain omitted until the unanswered preference in question 161 is confirmed.