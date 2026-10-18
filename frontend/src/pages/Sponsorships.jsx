import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./sponsorships.css";

const config = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};
const initialForm = { brand_name: "", campaign_name: "", amount: "", currency: "INR", payment_status: "Pending", start_date: "", due_date: "", notes: "" };

export default function Sponsorships() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await api.get("/sponsorships/", config());
      const data = response.data;
      setItems(Array.isArray(data) ? data : (data?.sponsorships || []));
    } catch (e) {
      setError(e.response?.status === 401 ? "Session expired. Please log in again." : (e.response?.data?.detail || "Could not load sponsorships. Check the backend and try again."));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);

  const change = (e) => setForm((old) => ({ ...old, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      await api.post("/sponsorships/", { ...form, amount: Number(form.amount), start_date: form.start_date || null, due_date: form.due_date || null, notes: form.notes || null }, config());
      setForm(initialForm); setShowForm(false); setMessage("Sponsorship added."); await loadItems();
    } catch (err) { setError(err.response?.data?.detail || "Could not save sponsorship. Check the fields and try again."); }
    finally { setSaving(false); }
  };
  const markPaid = async (item) => {
    setError(""); setMessage("");
    try {
      await api.patch(`/sponsorships/${item.id}/payment`, { payment_status: "Paid" }, config());
      setMessage("Payment status updated."); await loadItems();
    } catch (e) { setError(e.response?.data?.detail || "Could not update payment. Check the PATCH endpoint request format."); }
  };
  const money = (amount, currency = "INR") => {
    try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount || 0)); }
    catch { return `${currency} ${amount}`; }
  };
  const pending = items.filter(x => String(x.payment_status).toLowerCase() === "pending").length;
  const paid = items.filter(x => String(x.payment_status).toLowerCase() === "paid").length;

  return <div className="sp-page">
    <aside className="sp-sidebar">
      <button className="sp-logo" onClick={() => navigate("/dashboard")}>✦ CreatorIQ</button>
      <nav className="sp-navigation">
        <button className="sp-nav-item" onClick={() => navigate("/dashboard")}>▦ Dashboard</button>
        <button className="sp-nav-item" onClick={() => navigate("/content")}>▤ Content</button>
        <button className="sp-nav-item" onClick={() => navigate("/audience")}>◉ Audience</button>
        <button className="sp-nav-item" onClick={() => navigate("/growth-trends")}>↗ Growth & Trends</button>
        <button className="sp-nav-item" onClick={() => navigate("/earnings")}>₹ Earnings</button>
        <button className="sp-nav-item active" onClick={() => navigate("/sponsorships")}>◇ Sponsorships</button>
        <button className="sp-nav-item" onClick={() => navigate("/reports")}>▧ Reports</button>
        <button className="sp-nav-item" onClick={() => navigate("/instagram-analytics")}>◎ Instagram Analytics</button>
        <button className="sp-nav-item" onClick={() => navigate("/social-media")}>🔗 Social Media</button>
        <button className="sp-nav-item" onClick={() => navigate("/settings")}>⚙ Settings</button>
      </nav>
    </aside>
    <main className="sp-main">
      <header className="sp-header"><div><span className="sp-eyebrow">REVENUE MANAGEMENT</span><h1>Sponsorships</h1><p>Track brand campaigns, payment status, and due dates.</p></div><button className="sp-primary" onClick={() => { setShowForm(v => !v); setMessage(""); }}>{showForm ? "Cancel" : "+ Add sponsorship"}</button></header>
      {error && <div className="sp-alert error">{error}</div>}{message && <div className="sp-alert success">{message}</div>}
      <section className="sp-stats"><article><span>Total campaigns</span><strong>{items.length}</strong></article><article><span>Pending payments</span><strong>{pending}</strong></article><article><span>Paid campaigns</span><strong>{paid}</strong></article></section>
      {showForm && <form className="sp-card sp-form" onSubmit={submit}><h2>Add sponsorship</h2><p>Record a brand campaign and its payment details.</p><div className="sp-fields">
        <label>Brand name<input name="brand_name" value={form.brand_name} onChange={change} required placeholder="e.g. Nike" /></label><label>Campaign name<input name="campaign_name" value={form.campaign_name} onChange={change} required placeholder="e.g. Summer campaign" /></label><label>Amount<input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={change} required /></label><label>Currency<select name="currency" value={form.currency} onChange={change}><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option></select></label><label>Payment status<select name="payment_status" value={form.payment_status} onChange={change}><option>Pending</option><option>Paid</option></select></label><label>Start date<input type="date" name="start_date" value={form.start_date} onChange={change} /></label><label>Due date<input type="date" name="due_date" value={form.due_date} onChange={change} /></label><label className="sp-notes">Notes<textarea name="notes" value={form.notes} onChange={change} rows="2" /></label>
      </div><div className="sp-actions"><button type="button" className="sp-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="sp-primary" disabled={saving}>{saving ? "Saving…" : "Save sponsorship"}</button></div></form>}
      <section className="sp-card"><div className="sp-table-head"><div><h2>Your campaigns</h2><p>Data loaded from your account</p></div><button className="sp-secondary" onClick={loadItems}>↻ Refresh</button></div>
        {loading ? <p className="sp-empty">Loading sponsorships…</p> : items.length === 0 ? <div className="sp-empty"><strong>No sponsorships yet</strong><p>Add a brand campaign to start tracking it.</p></div> : <div className="sp-table-wrap"><table className="sp-table"><thead><tr><th>Brand / Campaign</th><th>Amount</th><th>Status</th><th>Due date</th><th>Action</th></tr></thead><tbody>{items.map(item => { const isPaid = String(item.payment_status).toLowerCase() === "paid"; return <tr key={item.id}><td><strong>{item.brand_name}</strong><small>{item.campaign_name}</small></td><td>{money(item.amount, item.currency)}</td><td><span className={`sp-status ${isPaid ? "paid" : "pending"}`}>{item.payment_status || "Pending"}</span></td><td>{item.due_date ? String(item.due_date).slice(0, 10) : "—"}</td><td>{isPaid ? <span className="sp-done">✓ Paid</span> : <button className="sp-mark" onClick={() => markPaid(item)}>Mark paid</button>}</td></tr>; })}</tbody></table></div>}
      </section><p className="sp-footnote">These sponsorship payments are between brands and creators, not payments to CreatorIQ.</p>
    </main>
  </div>;
}
