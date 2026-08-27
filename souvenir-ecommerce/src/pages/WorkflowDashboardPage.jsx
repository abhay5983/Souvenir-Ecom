import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { workflowService } from "../services/workflowService.js";

const actionsByRole = {
  BUSINESS_MANAGER: ["SUBMITTED_TO_BM", "bm_forward", "Forward to Coordinator"],
  SALES_REP: ["SUBMITTED_TO_BM", "bm_forward", "Forward to Coordinator"],
  SALES_MANAGER: ["SUBMITTED_TO_BM", "bm_forward", "Forward to Coordinator"],
  COORDINATOR: ["PENDING_COORDINATOR_REVIEW", "coordinator_forward", "Forward to Coordinator Head"],
  COORDINATOR_HEAD: ["PENDING_HEAD_APPROVAL", "head_approve", "Approve request"],
  INVENTORY: ["READY_FOR_INVENTORY", "inventory_start", "Start packing"],
  INVENTORY_SUPERVISOR: ["PENDING_SUPERVISOR_VERIFICATION", "supervisor_release", "Verify and release"],
  DISPATCH: ["READY_FOR_DISPATCH", "dispatch", "Create dispatch"],
};

function WorkflowDashboardPage() {
  const { user, role } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try { setItems(await workflowService.list()); }
    catch (error) { setMessage(error.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function perform(item, action) {
    const details = {};
    if (action === "dispatch") {
      details.transporter = window.prompt("Transporter name:") ?? "";
      details.consignmentNumber = window.prompt("Consignment number:") ?? "";
      if (!details.transporter || !details.consignmentNumber) return;
    }
    setBusy(item.id);
    setMessage("");
    try {
      await workflowService.action(item.id, action, details);
      setMessage(`${item.reference} updated successfully.`);
      await load();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(null); }
  }

  const configured = actionsByRole[role];
  return (
    <section className="portal-main control-main">
      <div className="container">
        <div className="dashboard-head">
          <div><p className="eyebrow">Live Django workflow</p><h1>{user?.name}&apos;s request dashboard</h1><p>Only requests within your assigned account, Business Manager, state, or operational stage are shown.</p></div>
          {["SCHOOL_ADMIN", "BUSINESS_MANAGER", "SALES_REP", "SALES_MANAGER", "DISTRIBUTOR_ADMIN"].includes(role) && <Link className="button" to="/app/catalog">Create request</Link>}
        </div>
        {message && <div className="notice neutral" role="status">{message}</div>}
        <div className="table-scroll card panel">
          <table className="control-table">
            <thead><tr><th>Reference</th><th>Account</th><th>Type</th><th>Status</th><th>Created by</th><th>Action</th></tr></thead>
            <tbody>
              {items.map((item) => {
                let action = configured && item.status === configured[0] ? configured : null;
                if (role === "INVENTORY" && item.status === "PACKING_IN_PROGRESS") action = [item.status, "inventory_complete", "Complete packing"];
                if (role === "DISPATCH" && item.status === "DISPATCHED") action = [item.status, "deliver", "Mark delivered"];
                return <tr key={item.id}>
                  <td><Link className="text-link" to={`/requests/${item.id}`}><strong>{item.reference}</strong></Link></td><td>{item.accountName}<br/><small>{item.state}</small></td>
                  <td>{item.requestType}</td><td><span className="status neutral">{item.status.replaceAll("_", " ")}</span></td><td>{item.createdBy}</td>
                  <td><div className="actions-row"><Link className="button ghost small" to={`/requests/${item.id}`}>View details</Link>{action && action[1] !== "dispatch" ? <button className="button secondary" disabled={busy === item.id} onClick={() => perform(item, action[1])}>{busy === item.id ? "Updating..." : action[2]}</button> : null}</div></td>
                </tr>;
              })}
              {!items.length && <tr><td colSpan="6">No requests are currently assigned to this dashboard.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default WorkflowDashboardPage;
