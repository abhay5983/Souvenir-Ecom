import { useCallback, useEffect, useMemo, useState } from "react";
import { requestHubService } from "../services/requestHubService.js";

const OUTREACH_STATUSES = ["NEW", "IN_REVIEW", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];
const DIGITAL_STATUSES = ["RECEIVED", "UNDER_REVIEW", "APPROVED", "DECLINED", "FULFILLED"];
const ORDER_STATUSES = ["AWAITING_PAYMENT", "PAID", "PROCESSING", "READY_TO_SHIP", "CANCELLED", "COMPLETED"];
const NEW_STATUSES = ["NEW", "RECEIVED", "AWAITING_PAYMENT"];
const ACTIVE_STATUSES = ["IN_REVIEW", "UNDER_REVIEW", "WAITING_FOR_CUSTOMER", "APPROVED", "PAID", "PROCESSING", "READY_TO_SHIP"];
const DONE_STATUSES = ["RESOLVED", "CLOSED", "FULFILLED", "COMPLETED"];
const label = (value) => String(value ?? "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const statusGroup = (status) => NEW_STATUSES.includes(status) ? "new" : ACTIVE_STATUSES.includes(status) ? "active" : DONE_STATUSES.includes(status) ? "done" : "muted";
const shortDate = (value) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
const fullDate = (value) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

function DisplayValue({ value }) {
  if (Array.isArray(value)) return <div className="hub-value-list">{value.map((entry, index) => <span key={index}>{typeof entry === "object" ? Object.values(entry).filter(Boolean).join(" · ") : String(entry)}</span>)}</div>;
  if (value && typeof value === "object") return <div className="hub-value-list">{Object.entries(value).map(([key, entry]) => <span key={key}><strong>{label(key)}:</strong> {String(entry)}</span>)}</div>;
  return String(value);
}

function RequestHubPage() {
  const [admin, setAdmin] = useState(undefined);
  const [loginForm, setLoginForm] = useState({ identity: "", password: "" });
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ query: "", source: "ALL", status: "ALL", group: "ALL" });
  const [edit, setEdit] = useState({ status: "", assignedTeam: "", assignedTo: "", note: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true); setMessage("");
    try { const result = await requestHubService.list(); setItems(result.requests ?? []); setLastRefreshed(new Date()); }
    catch (error) { if (error.status === 401 || error.status === 403) setAdmin(null); setMessage(error.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    requestHubService.session()
      .then(async (session) => {
        if (!active) return;
        setAdmin(session.user);
        const result = await requestHubService.list();
        if (active) { setItems(result.requests ?? []); setLastRefreshed(new Date()); }
      })
      .catch((error) => { if (active) { setAdmin(null); if (error.status !== 401) setMessage(error.message); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => ({ ALL: items.length, NEW: items.filter((item) => NEW_STATUSES.includes(item.status)).length, ACTIVE: items.filter((item) => ACTIVE_STATUSES.includes(item.status)).length, DONE: items.filter((item) => DONE_STATUSES.includes(item.status)).length }), [items]);
  const filtered = useMemo(() => items.filter((item) => {
    const search = filters.query.trim().toLowerCase();
    const searchable = [item.reference, item.title, item.category, item.requesterName, item.organisation, item.email, item.mobile, item.state, item.assignedTeam, item.assignedTo];
    const matchesSearch = !search || searchable.some((value) => String(value ?? "").toLowerCase().includes(search));
    const matchesGroup = filters.group === "ALL" || (filters.group === "NEW" && NEW_STATUSES.includes(item.status)) || (filters.group === "ACTIVE" && ACTIVE_STATUSES.includes(item.status)) || (filters.group === "DONE" && DONE_STATUSES.includes(item.status));
    return matchesSearch && matchesGroup && (filters.source === "ALL" || item.source === filters.source) && (filters.status === "ALL" || item.status === filters.status);
  }), [filters, items]);
  const hasFilters = filters.query || filters.source !== "ALL" || filters.status !== "ALL" || filters.group !== "ALL";

  function open(item) { setSelected(item); setEdit({ status: item.status, assignedTeam: item.assignedTeam ?? "", assignedTo: item.assignedTo ?? "", note: "" }); }
  function clearFilters() { setFilters({ query: "", source: "ALL", status: "ALL", group: "ALL" }); }
  async function signIn(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const session = await requestHubService.login(loginForm);
      setAdmin(session.user); setLoginForm({ identity: "", password: "" });
      await loadRequests();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setMessage("");
    try { await requestHubService.logout(); setAdmin(null); setItems([]); setSelected(null); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { const updated = await requestHubService.update(selected, edit); setItems((current) => current.map((item) => item.source === updated.source && item.id === updated.id ? updated : item)); open(updated); setMessage(`${updated.reference} was updated successfully.`); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  function exportCsv() {
    const rows = [["Reference", "Source", "Type", "Status", "Requester", "Organisation", "Email", "Mobile", "Created"], ...filtered.map((item) => [item.reference, item.source, item.title, item.status, item.requesterName, item.organisation, item.email, item.mobile, item.createdAt])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "souvenir-requests.csv"; link.click(); URL.revokeObjectURL(link.href);
  }

  if (admin === undefined) return <section className="portal-main control-main hub-page"><div className="hub-auth-shell"><div className="card hub-auth-card"><div className="hub-auth-mark">S</div><p className="eyebrow">Secure administration</p><h1>Checking access</h1><p>Verifying your administrator session…</p></div></div></section>;
  if (!admin) return <section className="portal-main control-main hub-page"><div className="hub-auth-shell"><form className="card hub-auth-card" onSubmit={signIn}><div className="hub-auth-mark">S</div><p className="eyebrow">Secure administration</p><h1>Request dashboard</h1><p>Sign in with an active Django administrator or staff account.</p>{message && <div className="notice danger" role="alert">{message}</div>}<div className="form-field"><label htmlFor="hub-identity">Username or email</label><input id="hub-identity" autoComplete="username" value={loginForm.identity} onChange={(event) => setLoginForm((current) => ({ ...current, identity: event.target.value }))} required autoFocus /></div><div className="form-field"><label htmlFor="hub-password">Password</label><input id="hub-password" type="password" autoComplete="current-password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} required /></div><button className="button full-width" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button><small>Customer and order information is restricted to authorised staff.</small></form></div></section>;

  return <section className="portal-main control-main hub-page"><div className="container request-hub">
    <header className="hub-header"><div><p className="eyebrow">Central request dashboard</p><h1>Customer operations</h1><p>Review ecommerce orders, digital-resource requests and public enquiries from one secure workspace.</p></div><div className="hub-header-actions"><div className="hub-admin-user"><strong>{admin.name}</strong><small>Administrator</small></div><button className="button secondary" type="button" onClick={loadRequests} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button><button className="button ghost" type="button" onClick={exportCsv} disabled={!filtered.length}>Export CSV</button><button className="button ghost" type="button" onClick={signOut} disabled={busy}>Sign out</button></div></header>
    <div className="hub-secure-note" role="note"><strong>Secure staff workspace</strong><span>{lastRefreshed ? `Last refreshed ${lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Loading current requests"}</span></div>
    {message && <div className="notice neutral" role="status">{message}</div>}
    <nav className="hub-summary" aria-label="Filter by progress">{[["ALL", "All requests", "Complete queue"], ["NEW", "New", "Needs attention"], ["ACTIVE", "In progress", "Being handled"], ["DONE", "Completed", "Resolved or closed"]].map(([group, title, hint]) => <button key={group} type="button" className={`hub-summary-card ${filters.group === group ? "active" : ""}`} onClick={() => setFilters((current) => ({ ...current, group, status: "ALL" }))}><span>{title}</span><strong>{counts[group]}</strong><small>{hint}</small></button>)}</nav>
    <section className="card hub-toolbar" aria-label="Request filters"><div className="hub-search"><label htmlFor="hub-search">Search requests</label><input id="hub-search" type="search" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Search order number, reference, name, phone or email" /></div><div className="form-field"><label htmlFor="hub-source">Request type</label><select id="hub-source" value={filters.source} onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))}><option value="ALL">All request types</option><option value="ORDER">Book orders</option><option value="DIGITAL">Digital resources</option><option value="OUTREACH">Public outreach</option></select></div><div className="form-field"><label htmlFor="hub-status">Exact status</label><select id="hub-status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, group: "ALL" }))}><option value="ALL">Any status</option>{[...new Set(items.map((item) => item.status))].map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></div>{hasFilters && <button className="hub-clear" type="button" onClick={clearFilters}>Clear filters</button>}</section>
    <div className="hub-results-head"><div><strong>{filtered.length}</strong> {filtered.length === 1 ? "request" : "requests"}</div><span>Newest first</span></div>
    <div className="request-hub-layout"><section className="card hub-queue" aria-label="Requests">
      {loading ? <div className="hub-empty"><strong>Loading requests…</strong><span>Please wait a moment.</span></div> : filtered.map((item) => <button key={`${item.source}-${item.id}`} type="button" className={`hub-request-row ${selected?.source === item.source && selected?.id === item.id ? "selected" : ""}`} onClick={() => open(item)}><span className={`hub-type-icon ${item.source.toLowerCase()}`} aria-hidden="true">{item.source === "ORDER" ? "OR" : item.source === "DIGITAL" ? "DR" : "PR"}</span><span className="hub-request-main"><span className="hub-request-top"><strong>{item.title}{item.source === "ORDER" ? ` · ${item.payload.orderTotal}` : ""}</strong><span className={`hub-status ${statusGroup(item.status)}`}>{label(item.status)}</span></span><span className="hub-request-person">{item.requesterName || "Name not supplied"}{item.organisation ? ` · ${item.organisation}` : ""}</span><span className="hub-request-meta"><span>{item.reference}</span><span>{item.source === "ORDER" ? "Customer order" : label(item.source)}</span><span>{item.state || "State not supplied"}</span></span></span><span className="hub-request-side"><strong>{shortDate(item.createdAt)}</strong><span>{item.assignedTeam || "Unassigned"}</span><span className="hub-view-link">View details →</span></span></button>)}
      {!loading && !filtered.length && <div className="hub-empty"><strong>No requests found</strong><span>Try changing or clearing the filters.</span>{hasFilters && <button className="button secondary" type="button" onClick={clearFilters}>Clear all filters</button>}</div>}
    </section>
    {selected ? <aside className="card request-hub-detail" aria-label="Request details"><button className="hub-detail-close" type="button" aria-label="Close request details" onClick={() => setSelected(null)}>×</button><div className="hub-detail-heading"><div className={`hub-type-icon ${selected.source.toLowerCase()}`}>{selected.source === "ORDER" ? "OR" : selected.source === "DIGITAL" ? "DR" : "PR"}</div><div><p>{selected.reference}</p><h2>{selected.title}</h2></div></div><div className="hub-detail-badges"><span className={`hub-status ${statusGroup(selected.status)}`}>{label(selected.status)}</span>{selected.confidential && <span className="hub-confidential">Confidential</span>}</div>
      <section className="hub-detail-section"><h3>Contact</h3><div className="hub-contact-card"><strong>{selected.requesterName || "Name not supplied"}</strong><span>{selected.organisation || "Organisation not supplied"}</span>{selected.email && <a href={`mailto:${selected.email}`}>{selected.email}</a>}{selected.mobile && <a href={`tel:${selected.mobile}`}>{selected.mobile}</a>}<span>{selected.state || "State not supplied"}</span></div></section>
      <dl className="hub-quick-meta"><div><dt>Received</dt><dd>{fullDate(selected.createdAt)}</dd></div><div><dt>Category</dt><dd>{selected.category}</dd></div><div><dt>Assigned to</dt><dd>{selected.assignedTo || "Not assigned"}</dd></div></dl>
      <section className="hub-detail-section"><h3>Submitted information</h3><dl className="hub-payload">{Object.entries(selected.payload ?? {}).filter(([, value]) => value !== "" && value !== false && value != null).map(([key, value]) => <div key={key}><dt>{label(key)}</dt><dd><DisplayValue value={value} /></dd></div>)}</dl></section>
      {!!selected.notes?.length && <section className="hub-detail-section"><h3>Internal notes</h3><div className="hub-timeline">{selected.notes.map((note, index) => <div key={`${note.at}-${index}`}><strong>{note.actor || "Dashboard user"}</strong><p>{note.text}</p><small>{note.at ? fullDate(note.at) : ""}</small></div>)}</div></section>}
      <form className="hub-update-form" onSubmit={save}><h3>{selected.source === "ORDER" ? "Update order" : "Update request"}</h3><div className={selected.source === "ORDER" ? "" : "hub-edit-grid"}><div className="form-field"><label htmlFor="edit-status">Status</label><select id="edit-status" value={edit.status} onChange={(event) => setEdit((current) => ({ ...current, status: event.target.value }))}>{(selected.source === "ORDER" ? ORDER_STATUSES : selected.source === "DIGITAL" ? DIGITAL_STATUSES : OUTREACH_STATUSES).map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></div>{selected.source !== "ORDER" && <div className="form-field"><label htmlFor="edit-team">Assigned team</label><input id="edit-team" value={edit.assignedTeam} onChange={(event) => setEdit((current) => ({ ...current, assignedTeam: event.target.value }))} placeholder="e.g. Customer Care" /></div>}</div>{selected.source !== "ORDER" && <><div className="form-field"><label htmlFor="edit-person">Assigned person</label><input id="edit-person" value={edit.assignedTo} onChange={(event) => setEdit((current) => ({ ...current, assignedTo: event.target.value }))} placeholder="Person handling this request" /></div><div className="form-field"><label htmlFor="edit-note">Add an internal note</label><textarea id="edit-note" rows="3" value={edit.note} onChange={(event) => setEdit((current) => ({ ...current, note: event.target.value }))} placeholder="Add a follow-up note (optional)" /></div></>}<button className="button full-width" disabled={busy}>{busy ? "Saving changes…" : "Save changes"}</button></form>
    </aside> : <aside className="card hub-detail-placeholder"><div className="hub-placeholder-icon" aria-hidden="true">↗</div><strong>Select a request</strong><span>Choose any request from the list to view its complete details and update its status.</span></aside>}
    </div>
  </div></section>;
}

export default RequestHubPage;
