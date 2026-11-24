"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Inquiry = { id: string; reference_code: string; customer_name: string; phone: string; wilaya: string; message: string | null; status: string; assigned_to: string | null; created_at: string; vehicle: { brand: string; model: string; year: number } | null };
type Staff = { id: string; username: string; full_name: string; role: string };
type Note = { id: string; inquiry_id: string; author_id: string; note: string; created_at: string; author: { full_name: string; username: string } | null };
type State = { inquiries: Inquiry[]; staff: Staff[]; notes: Note[] };
const labels: Record<string,string> = { new: "جديد", contacted: "تم التواصل", closed: "مغلق" };

export function InquiryManager({ currentUser, role }: { currentUser: string; role: string }) {
  const [data, setData] = useState<State>({ inquiries: [], staff: [], notes: [] });
  const [filter, setFilter] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [incoming, setIncoming] = useState(0);
  const seenNewCount = useRef(0);
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/inquiries", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "تعذر تحميل الطلبات."); return; }
    const count = (result.inquiries || []).filter((item: Inquiry) => item.status === "new").length;
    if (seenNewCount.current && count > seenNewCount.current) setIncoming((current) => current + count - seenNewCount.current);
    seenNewCount.current = count;
    setData(result);
  }, []);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 45000); return () => window.clearInterval(timer); }, [load]);
  async function update(body: Record<string, string>) {
    setError(""); setMessage("");
    const response = await fetch("/api/admin/inquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "تعذر التحديث."); return; }
    setMessage("تم حفظ التحديث."); await load();
  }
  const shown = data.inquiries.filter((item) => filter === "all" || item.status === filter);
  return <div className="inquiry-manager">
    {incoming > 0 && <button className="inquiry-toast" onClick={()=>setIncoming(0)}>وصلت {incoming} طلبات جديدة. عرضها في القائمة ↓</button>}
    {error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="staff-notice" role="status">{message}</p>}
    <div className="inquiry-filters">{[["all","الكل"],["new","الجديدة"],["contacted","تم التواصل"],["closed","المغلقة"]].map(([value,label])=><button className={filter===value?"active":""} onClick={()=>setFilter(value)} key={value}>{label} <b>{value==="all"?data.inquiries.length:data.inquiries.filter(x=>x.status===value).length}</b></button>)}</div>
    {!shown.length ? <div className="admin-empty"><h2>لا توجد طلبات ضمن هذا الاختيار</h2><p>ستظهر طلبات العملاء هنا بعد إرسالها من صفحات السيارات.</p></div> : <div className="inquiry-cards">{shown.map((item)=>{
      const vehicle = Array.isArray(item.vehicle) ? item.vehicle[0] : item.vehicle;
      const notes = data.notes.filter((note)=>note.inquiry_id===item.id);
      return <article className="inquiry-card" key={item.id}><header><div><span className={`status ${item.status==="new"?"amber":item.status==="contacted"?"green":"gray"}`}>{labels[item.status]||item.status}</span><b>رقم {item.reference_code}</b></div><time>{new Intl.DateTimeFormat("ar-DZ",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.created_at))}</time></header>
        <div className="inquiry-customer"><h2>{item.customer_name}</h2><a href={`tel:${item.phone}`}>{item.phone}</a><span>{item.wilaya}</span></div>
        <p>السيارة: {vehicle?`${vehicle.brand} ${vehicle.model} · ${vehicle.year}`:"استفسار عام"}</p>{item.message&&<blockquote>{item.message}</blockquote>}
        <div className="inquiry-actions"><label>حالة الطلب<select value={item.status} onChange={(e)=>void update({action:"status",id:item.id,status:e.target.value})}><option value="new">جديد</option><option value="contacted">تم التواصل</option><option value="closed">مغلق</option></select></label>{["owner","manager"].includes(role)&&<label>الموظف المسؤول<select value={item.assigned_to||""} onChange={(e)=>void update({action:"assign",id:item.id,staffId:e.target.value})}><option value="">غير مسند</option>{data.staff.map((person)=><option key={person.id} value={person.id}>{person.full_name||person.username}</option>)}</select></label>}</div>
        <section className="contact-history"><h3>سجل التواصل</h3>{notes.map((note)=><div className="contact-note" key={note.id}><p>{note.note}</p><small>{note.author?.full_name||note.author?.username||"موظف"} · {new Intl.DateTimeFormat("ar-DZ",{dateStyle:"short",timeStyle:"short"}).format(new Date(note.created_at))}</small>{(note.author_id===currentUser||["owner","manager"].includes(role))&&<button onClick={()=>void update({action:"delete_note",noteId:note.id})}>حذف</button>}</div>)}<form onSubmit={(event)=>{event.preventDefault();const note=drafts[item.id]?.trim();if(note){void update({action:"note",inquiryId:item.id,note});setDrafts((current)=>({...current,[item.id]:""}));}}}><textarea value={drafts[item.id]||""} onChange={(e)=>setDrafts((current)=>({...current,[item.id]:e.target.value}))} maxLength={2000} rows={2} placeholder="دوّن مكالمة أو تحديثاً للفريق…"/><button className="outline-button dark-outline">إضافة ملاحظة</button></form></section>
        <a className="inquiry-follow" href={`/inquiry/${item.reference_code}`} target="_blank">صفحة المتابعة العامة ↗</a>
      </article>;
    })}</div>}
    <p className="vehicle-help">يعرض النظام الطلبات خلال آخر 3 أشهر، بحد أقصى 200 طلب.</p>
  </div>;
}
