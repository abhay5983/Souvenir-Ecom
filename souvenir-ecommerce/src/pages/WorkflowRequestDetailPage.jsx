import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { catalogue } from "../data/catalog.js";
import { useAuth } from "../context/AuthContext.jsx";
import { workflowService } from "../services/workflowService.js";

function lineTitle(line) {
  if (line.title) return line.title;
  const series = catalogue.find((item) => item.id === line.seriesId);
  const variant = series?.variants?.find((item) => item.id === line.variantId);
  return variant?.title ?? series?.title ?? line.productId ?? "Book";
}

const primaryActions = {
  BUSINESS_MANAGER: ["SUBMITTED_TO_BM", "bm_forward", "Forward to Coordinator"],
  SALES_REP: ["SUBMITTED_TO_BM", "bm_forward", "Forward to Coordinator"],
  SALES_MANAGER: ["SUBMITTED_TO_BM", "bm_forward", "Forward to Coordinator"],
  COORDINATOR: ["PENDING_COORDINATOR_REVIEW", "coordinator_forward", "Forward to Coordinator Head"],
  COORDINATOR_HEAD: ["PENDING_HEAD_APPROVAL", "head_approve", "Approve request"],
  INVENTORY: ["READY_FOR_INVENTORY", "inventory_start", "Start packing"],
  INVENTORY_SUPERVISOR: ["PENDING_SUPERVISOR_VERIFICATION", "supervisor_release", "Verify and release"],
  DISPATCH: ["READY_FOR_DISPATCH", "dispatch", "Create dispatch"],
};

function WorkflowRequestDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dispatch, setDispatch] = useState({ transporter: "", consignmentNumber: "", trackingUrl: "" });

  async function load() {
    try { setItem(await workflowService.get(requestId)); setError(""); }
    catch (requestError) { setError(requestError.message); }
  }
  useEffect(() => { load(); }, [requestId]);

  const action = useMemo(() => {
    const configured = primaryActions[role];
    if (configured && configured[0] === item?.status) return configured;
    if (role === "INVENTORY" && item?.status === "PACKING_IN_PROGRESS") return [item.status, "inventory_complete", "Complete packing"];
    if (role === "DISPATCH" && item?.status === "DISPATCHED") return [item.status, "deliver", "Mark delivered"];
    return null;
  }, [item, role]);

  async function perform(actionName) {
    let note = "";
    const details = {};
    if (actionName === "head_reject") {
      note = window.prompt("Reason for rejection:")?.trim() ?? "";
      if (!note) return;
    }
    if (actionName === "dispatch") {
      if (!dispatch.transporter.trim() || !dispatch.consignmentNumber.trim()) {
        setError("Transporter and consignment number are required.");
        return;
      }
      Object.assign(details, dispatch);
    }
    setBusy(true);
    try { await workflowService.action(item.id, actionName, { ...details, note }); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  if (error && !item) return <section className="portal-main"><div className="container"><div className="notice danger">{error}</div><button className="button" onClick={() => navigate(-1)}>Go back</button></div></section>;
  if (!item) return <section className="portal-main"><div className="container"><p>Loading request...</p></div></section>;

  return <section className="portal-main control-main"><div className="container">
    <nav className="breadcrumbs"><button className="text-link" onClick={() => navigate(-1)}>Requests</button><span>/</span><span>{item.reference}</span></nav>
    <div className="control-titlebar"><div><p className="eyebrow">{item.requestType} request</p><h1>{item.reference}</h1><p>{item.accountName} · {item.state}</p></div><span className="status neutral">{item.status.replaceAll("_", " ")}</span></div>
    {error && <div className="notice danger">{error}</div>}
    <div className="form-shell">
      <div className="form-card">
        <h2>Requested books</h2>
        <div className="table-scroll"><table className="control-table"><thead><tr><th>Book</th><th>Quantity</th></tr></thead><tbody>{item.lines.map((line, index) => <tr key={line.productId ?? index}><td>{lineTitle(line)}</td><td>{line.quantity}</td></tr>)}</tbody></table></div>
        <h2>Request assignment</h2>
        <dl className="detail-meta"><div><dt>Created by</dt><dd>{item.createdBy}</dd></div><div><dt>Business Manager</dt><dd>{item.assignedBm ?? "Not assigned"}</dd></div><div><dt>Coordinator</dt><dd>{item.assignedCoordinator ?? "Not assigned"}</dd></div><div><dt>Account</dt><dd>{item.accountName}</dd></div></dl>
        {Object.keys(item.deliveryAddress ?? {}).length > 0 && <><h2>Delivery address</h2><p>{Object.values(item.deliveryAddress).filter(Boolean).join(", ")}</p></>}
      </div>
      <aside className="summary-card">
        <h2>Available action</h2>
        {role === "DISPATCH" && item.status === "READY_FOR_DISPATCH" && <div className="form-grid"><div className="form-field"><label>Transporter</label><input value={dispatch.transporter} onChange={(event) => setDispatch((current) => ({ ...current, transporter: event.target.value }))}/></div><div className="form-field"><label>Consignment number</label><input value={dispatch.consignmentNumber} onChange={(event) => setDispatch((current) => ({ ...current, consignmentNumber: event.target.value }))}/></div><div className="form-field"><label>Tracking URL</label><input type="url" value={dispatch.trackingUrl} onChange={(event) => setDispatch((current) => ({ ...current, trackingUrl: event.target.value }))}/></div></div>}
        {action ? <button className="button" disabled={busy} onClick={() => perform(action[1])}>{busy ? "Updating..." : action[2]}</button> : <p>No action is required from your role at this stage.</p>}
        {role === "COORDINATOR_HEAD" && item.status === "PENDING_HEAD_APPROVAL" && <button className="button secondary" disabled={busy} onClick={() => perform("head_reject")}>Reject request</button>}
      </aside>
    </div>
    <section className="card panel space-top-lg"><div className="panel-head"><h2>Request history</h2></div><div className="table-scroll"><table className="control-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Status</th><th>Note</th></tr></thead><tbody>{item.events.map((event, index) => <tr key={`${event.createdAt}-${index}`}><td>{new Date(event.createdAt).toLocaleString()}</td><td>{event.actor}</td><td>{event.action.replaceAll("_", " ")}</td><td>{event.toStatus.replaceAll("_", " ")}</td><td>{event.note || "—"}</td></tr>)}</tbody></table></div></section>
  </div></section>;
}

export default WorkflowRequestDetailPage;
