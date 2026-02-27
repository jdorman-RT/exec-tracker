import { useState, useMemo, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase config ──────────────────────────────────────────────
// Replace these two values with your own from the Supabase dashboard
const SUPABASE_URL = "https://swgiobyvjjmogsqtuxuf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xW_NYEqeDWTYjEwwxmoilQ_8UBgkDrN";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ────────────────────────────────────────────────────────────────

const defaultTabs = [
  { id: "ceo", label: "CEOs" },
  { id: "commercial", label: "Commercial Leaders" },
];

const emptyExec = (tabId) => ({
  id: crypto.randomUUID(),
  tab_id: tabId,
  name: "",
  current_role: "",
  former_role: "",
  specialty: "",
  relationship_owner: "",
  notes: "",
  notes_visible: false,
  actions_visible: false,
  status: "active",
  actions: [],
});

const COLS = [
  { key: "name", label: "Name" },
  { key: "current_role", label: "Current Role" },
  { key: "former_role", label: "Former Role" },
  { key: "specialty", label: "Specialty" },
  { key: "relationship_owner", label: "Relationship Owner" },
];

const PLACEHOLDERS = {
  name: "Full name",
  current_role: "Current title / company",
  former_role: "Previous title / company",
  specialty: "Area of expertise",
  relationship_owner: "Owner",
};

const thStyle = {
  padding: "11px 12px", textAlign: "left", fontSize: 12, fontWeight: 700,
  color: "#475569", textTransform: "uppercase", letterSpacing: ".04em",
  borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap"
};

function getDueSoon(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "soon";
  return null;
}

// ── Action Panel ─────────────────────────────────────────────────
function ActionPanel({ exec, onUpdate }) {
  const emptyAction = () => ({ id: crypto.randomUUID(), text: "", dueDate: "", assignee: "", done: false });
  const [newAction, setNewAction] = useState(emptyAction());

  const addAction = () => {
    if (!newAction.text.trim()) return;
    const updated = [...(exec.actions || []), { ...newAction }];
    onUpdate(exec.id, "actions", updated);
    setNewAction(emptyAction());
  };

  const updateAction = (actionId, field, value) => {
    const updated = exec.actions.map(a => a.id === actionId ? { ...a, [field]: value } : a);
    onUpdate(exec.id, "actions", updated);
  };

  const deleteAction = (actionId) => {
    onUpdate(exec.id, "actions", exec.actions.filter(a => a.id !== actionId));
  };

  const open = (exec.actions || []).filter(a => !a.done);
  const done = (exec.actions || []).filter(a => a.done);

  return (
    <div style={{ padding: "4px 16px 14px 54px" }}>
      <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
          📋 Action Items
        </div>
        {open.length === 0 && done.length === 0 && (
          <p style={{ fontSize: 13, color: "#a16207", margin: "0 0 10px", fontStyle: "italic" }}>No action items yet. Add one below.</p>
        )}
        {open.map(action => {
          const urgency = getDueSoon(action.dueDate);
          return (
            <div key={action.id} style={{
              display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
              background: "#fff", borderRadius: 8, marginBottom: 6,
              border: urgency === "overdue" ? "1.5px solid #fca5a5" : urgency === "soon" ? "1.5px solid #fcd34d" : "1.5px solid #e2e8f0"
            }}>
              <input type="checkbox" checked={false} onChange={() => updateAction(action.id, "done", true)}
                style={{ marginTop: 3, cursor: "pointer", accentColor: "#2563eb" }} />
              <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
                <input value={action.text} onChange={e => updateAction(action.id, "text", e.target.value)}
                  placeholder="Action description..."
                  style={{ flex: "2 1 180px", padding: "4px 6px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#93c5fd"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                <input value={action.assignee} onChange={e => updateAction(action.id, "assignee", e.target.value)}
                  placeholder="Assign to..."
                  style={{ flex: "1 1 110px", padding: "4px 6px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#93c5fd"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
                <div style={{ display: "flex", alignItems: "center", gap: 4, flex: "1 1 140px" }}>
                  <input type="date" value={action.dueDate} onChange={e => updateAction(action.id, "dueDate", e.target.value)}
                    style={{ padding: "4px 6px", border: `1px solid ${urgency === "overdue" ? "#fca5a5" : urgency === "soon" ? "#fcd34d" : "#e2e8f0"}`, borderRadius: 5, fontSize: 12, outline: "none", flex: 1 }} />
                  {urgency === "overdue" && <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", whiteSpace: "nowrap" }}>Overdue</span>}
                  {urgency === "soon" && <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", whiteSpace: "nowrap" }}>Due soon</span>}
                </div>
              </div>
              <button onClick={() => deleteAction(action.id)} style={{ background: "none", border: "none", color: "#d1d5db", fontSize: 14, cursor: "pointer", padding: "2px 4px" }}>🗑</button>
            </div>
          );
        })}
        {done.length > 0 && (
          <details style={{ marginTop: 8, marginBottom: 8 }}>
            <summary style={{ fontSize: 12, color: "#6b7280", cursor: "pointer", fontWeight: 600, userSelect: "none" }}>✓ {done.length} completed</summary>
            <div style={{ marginTop: 6 }}>
              {done.map(action => (
                <div key={action.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 8, marginBottom: 4, opacity: 0.7 }}>
                  <input type="checkbox" checked={true} onChange={() => updateAction(action.id, "done", false)} style={{ cursor: "pointer", accentColor: "#2563eb" }} />
                  <span style={{ fontSize: 13, color: "#6b7280", textDecoration: "line-through", flex: 1 }}>{action.text}</span>
                  {action.assignee && <span style={{ fontSize: 12, color: "#9ca3af" }}>{action.assignee}</span>}
                  <button onClick={() => deleteAction(action.id)} style={{ background: "none", border: "none", color: "#d1d5db", fontSize: 13, cursor: "pointer" }}>🗑</button>
                </div>
              ))}
            </div>
          </details>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, alignItems: "center", paddingTop: 10, borderTop: "1px dashed #fde68a" }}>
          <input value={newAction.text} onChange={e => setNewAction(a => ({ ...a, text: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addAction()} placeholder="New action item..."
            style={{ flex: "2 1 180px", padding: "6px 8px", border: "1.5px solid #fde68a", borderRadius: 6, fontSize: 13, outline: "none", background: "#fffdf5" }}
            onFocus={e => e.target.style.borderColor = "#f59e0b"}
            onBlur={e => e.target.style.borderColor = "#fde68a"} />
          <input value={newAction.assignee} onChange={e => setNewAction(a => ({ ...a, assignee: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addAction()} placeholder="Assign to..."
            style={{ flex: "1 1 110px", padding: "6px 8px", border: "1.5px solid #fde68a", borderRadius: 6, fontSize: 13, outline: "none", background: "#fffdf5" }}
            onFocus={e => e.target.style.borderColor = "#f59e0b"}
            onBlur={e => e.target.style.borderColor = "#fde68a"} />
          <input type="date" value={newAction.dueDate} onChange={e => setNewAction(a => ({ ...a, dueDate: e.target.value }))}
            style={{ flex: "1 1 130px", padding: "6px 8px", border: "1.5px solid #fde68a", borderRadius: 6, fontSize: 13, outline: "none", background: "#fffdf5" }} />
          <button onClick={addAction} style={{ padding: "6px 14px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Exec Row ─────────────────────────────────────────────────────
function ExecRow({ exec, i, section, onUpdate, onDelete, deleteConfirm, setDeleteConfirm }) {
  const openActions = (exec.actions || []).filter(a => !a.done);
  const overdueCount = openActions.filter(a => getDueSoon(a.dueDate) === "overdue").length;
  const soonCount = openActions.filter(a => getDueSoon(a.dueDate) === "soon").length;

  return (
    <>
      <tr style={{ borderBottom: (exec.notes_visible || exec.actions_visible) ? "none" : "1px solid #f1f5f9", background: section === "inactive" ? "#fafafa" : i % 2 === 0 ? "#fff" : "#f8fafc" }}>
        <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
          <button onClick={() => onUpdate(exec.id, "status", exec.status === "active" ? "inactive" : "active")}
            style={{ padding: "4px 10px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: exec.status === "active" ? "#dcfce7" : "#f1f5f9",
              color: exec.status === "active" ? "#16a34a" : "#94a3b8" }}>
            {exec.status === "active" ? "● Active" : "○ Inactive"}
          </button>
        </td>
        {COLS.map(col => (
          <td key={col.key} style={{ padding: "8px 8px" }}>
            <input value={exec[col.key]} onChange={e => onUpdate(exec.id, col.key, e.target.value)}
              placeholder={PLACEHOLDERS[col.key]}
              style={{ width: "100%", padding: "6px 8px", border: "1.5px solid transparent", borderRadius: 6, fontSize: 13,
                color: section === "inactive" ? "#94a3b8" : "#0f172a", background: "transparent", outline: "none",
                boxSizing: "border-box", fontStyle: section === "inactive" ? "italic" : "normal" }}
              onFocus={e => e.target.style.borderColor = "#93c5fd"}
              onBlur={e => e.target.style.borderColor = "transparent"} />
          </td>
        ))}
        <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
          <button onClick={() => onUpdate(exec.id, "actions_visible", !exec.actions_visible)}
            style={{ padding: "5px 10px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: exec.actions_visible ? "#fef3c7" : openActions.length > 0 ? "#fffbeb" : "#f1f5f9",
              color: exec.actions_visible ? "#92400e" : openActions.length > 0 ? "#d97706" : "#64748b" }}>
            {exec.actions_visible ? "▲ Actions" : "▼ Actions"}
            {!exec.actions_visible && openActions.length > 0 && (
              <span style={{ marginLeft: 5, background: overdueCount > 0 ? "#ef4444" : soonCount > 0 ? "#f59e0b" : "#2563eb",
                color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>
                {openActions.length}
              </span>
            )}
          </button>
        </td>
        <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
          <button onClick={() => onUpdate(exec.id, "notes_visible", !exec.notes_visible)}
            style={{ padding: "5px 10px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: exec.notes_visible ? "#dbeafe" : "#f1f5f9",
              color: exec.notes_visible ? "#1d4ed8" : "#64748b" }}>
            {exec.notes_visible ? "▲ Notes" : "▼ Notes"}
          </button>
        </td>
        <td style={{ padding: "8px 8px" }}>
          {deleteConfirm === exec.id ? (
            <span style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ color: "#ef4444", fontSize: 11 }}>Delete?</span>
              <button onClick={() => onDelete(exec.id)} style={{ padding: "3px 7px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Yes</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "3px 7px", background: "#e2e8f0", border: "none", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>No</button>
            </span>
          ) : (
            <button onClick={() => setDeleteConfirm(exec.id)} style={{ background: "none", border: "none", color: "#cbd5e1", fontSize: 15, cursor: "pointer", padding: "2px 4px" }}>🗑</button>
          )}
        </td>
      </tr>
      {exec.actions_visible && (
        <tr style={{ background: section === "inactive" ? "#fafafa" : i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: exec.notes_visible ? "none" : "1px solid #f1f5f9" }}>
          <td colSpan={10}><ActionPanel exec={exec} onUpdate={onUpdate} /></td>
        </tr>
      )}
      {exec.notes_visible && (
        <tr style={{ background: section === "inactive" ? "#fafafa" : i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
          <td colSpan={10} style={{ padding: "0 14px 12px 54px" }}>
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "2px 4px" }}>
              <textarea value={exec.notes} onChange={e => onUpdate(exec.id, "notes", e.target.value)}
                placeholder="Add notes about this executive..."
                style={{ width: "100%", minHeight: 72, padding: "8px", border: "none", background: "transparent", fontSize: 13, color: "#334155", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [tabs, setTabs] = useState(defaultTabs);
  const [activeTab, setActiveTab] = useState("ceo");
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [showAddTab, setShowAddTab] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tabDeleteConfirm, setTabDeleteConfirm] = useState(null);
  const [sortConfig, setSortConfig] = useState({});
  const [filterConfig, setFilterConfig] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // ── Load data from Supabase on mount ──
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: tabData } = await supabase.from("tabs").select("*").order("sort_order");
      const { data: execData } = await supabase.from("executives").select("*");

      if (tabData && tabData.length > 0) {
        setTabs(tabData.map(t => ({ id: t.id, label: t.label })));
        setActiveTab(tabData[0].id);
      }
      if (execData) {
        const grouped = {};
        execData.forEach(e => {
          if (!grouped[e.tab_id]) grouped[e.tab_id] = [];
          grouped[e.tab_id].push({ ...e, actions: e.actions || [], notes_visible: false, actions_visible: false });
        });
        setRecords(grouped);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // ── Save exec to Supabase ──
  const saveExec = async (exec) => {
    setSaving(true);
    const { notes_visible, actions_visible, ...toSave } = exec;
    await supabase.from("executives").upsert(toSave);
    setSaving(false);
  };

  const deleteExecFromDB = async (id) => {
    await supabase.from("executives").delete().eq("id", id);
  };

  const tabSort = sortConfig[activeTab] || null;
  const tabFilter = filterConfig[activeTab] || {};
  const currentRecords = records[activeTab] || [];

  const setSort = (key) => {
    setSortConfig(s => {
      const cur = s[activeTab];
      const dir = cur?.key === key && cur.dir === "asc" ? "desc" : "asc";
      return { ...s, [activeTab]: { key, dir } };
    });
  };

  const setFilter = (col, val) => {
    setFilterConfig(f => ({ ...f, [activeTab]: { ...(f[activeTab] || {}), [col]: val } }));
  };

  const processedRecords = useMemo(() => {
    let rows = [...currentRecords];
    Object.entries(tabFilter).forEach(([col, val]) => {
      if (val?.trim()) rows = rows.filter(r => (r[col] || "").toLowerCase().includes(val.toLowerCase()));
    });
    if (tabSort) {
      rows.sort((a, b) => {
        const av = (a[tabSort.key] || "").toLowerCase();
        const bv = (b[tabSort.key] || "").toLowerCase();
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return tabSort.dir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [currentRecords, tabSort, tabFilter]);

  const activeExecs = processedRecords.filter(e => e.status === "active");
  const inactiveExecs = processedRecords.filter(e => e.status === "inactive");

  const allRecords = Object.values(records).flat();
  const totalOverdue = allRecords.reduce((n, e) => n + (e.actions || []).filter(a => !a.done && getDueSoon(a.dueDate) === "overdue").length, 0);
  const totalSoon = allRecords.reduce((n, e) => n + (e.actions || []).filter(a => !a.done && getDueSoon(a.dueDate) === "soon").length, 0);

  const updateRecord = useCallback((id, field, value) => {
    setRecords(r => {
      const updated = { ...r, [activeTab]: r[activeTab].map(e => e.id === id ? { ...e, [field]: value } : e) };
      const exec = updated[activeTab].find(e => e.id === id);
      // Only save "real" fields, not UI-only toggles
      const uiOnly = ["notes_visible", "actions_visible"];
      if (!uiOnly.includes(field)) saveExec(exec);
      return updated;
    });
  }, [activeTab]);

  const addRow = () => {
    const exec = emptyExec(activeTab);
    setRecords(r => ({ ...r, [activeTab]: [...(r[activeTab] || []), exec] }));
    saveExec(exec);
  };

  const deleteRow = useCallback(async (id) => {
    setRecords(r => ({ ...r, [activeTab]: r[activeTab].filter(e => e.id !== id) }));
    await deleteExecFromDB(id);
    setDeleteConfirm(null);
  }, [activeTab]);

  const addTab = async () => {
    if (!newTabName.trim()) return;
    const id = crypto.randomUUID();
    const newTab = { id, label: newTabName.trim() };
    setTabs(t => [...t, newTab]);
    setRecords(r => ({ ...r, [id]: [] }));
    setActiveTab(id);
    await supabase.from("tabs").insert({ id, label: newTabName.trim(), sort_order: tabs.length });
    setNewTabName("");
    setShowAddTab(false);
  };

  const removeTab = async (id) => {
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    const nr = { ...records };
    delete nr[id];
    setRecords(nr);
    setActiveTab(newTabs[0]?.id || "");
    await supabase.from("tabs").delete().eq("id", id);
    await supabase.from("executives").delete().eq("tab_id", id);
    setTabDeleteConfirm(null);
  };

  const hasActiveFilters = Object.values(tabFilter).some(v => v?.trim());
  const colCount = COLS.length + 4;

  const SortIcon = ({ col }) => {
    if (!tabSort || tabSort.key !== col) return <span style={{ color: "#cbd5e1", marginLeft: 4 }}>⇅</span>;
    return <span style={{ color: "#2563eb", marginLeft: 4 }}>{tabSort.dir === "asc" ? "↑" : "↓"}</span>;
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter, sans-serif", color: "#64748b", fontSize: 16 }}>
      Loading tracker…
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Executive Network Tracker</h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>
              Track and manage your executive relationships across roles
              {saving && <span style={{ marginLeft: 10, color: "#a3b3c6", fontSize: 12 }}>Saving…</span>}
            </p>
          </div>
          {(totalOverdue > 0 || totalSoon > 0) && (
            <div style={{ display: "flex", gap: 8 }}>
              {totalOverdue > 0 && <div style={{ padding: "6px 12px", background: "#fee2e2", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#dc2626" }}>⚠ {totalOverdue} overdue</div>}
              {totalSoon > 0 && <div style={{ padding: "6px 12px", background: "#fef3c7", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#d97706" }}>🕐 {totalSoon} due soon</div>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <div key={tab.id} style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => setActiveTab(tab.id)} style={{
                padding: "8px 16px", borderRadius: tabs.length > 1 ? "8px 0 0 8px" : "8px", border: "none",
                background: activeTab === tab.id ? "#2563eb" : "#e2e8f0",
                color: activeTab === tab.id ? "#fff" : "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer"
              }}>{tab.label}</button>
              {tabs.length > 1 && (
                tabDeleteConfirm === tab.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "#fee2e2", borderRadius: "0 8px 8px 0", border: "1.5px solid #fca5a5", borderLeft: "none" }}>
                    <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>Delete group?</span>
                    <button onClick={() => removeTab(tab.id)} style={{ padding: "2px 7px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Yes</button>
                    <button onClick={() => setTabDeleteConfirm(null)} style={{ padding: "2px 7px", background: "#fff", color: "#6b7280", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>No</button>
                  </div>
                ) : (
                  <button onClick={() => setTabDeleteConfirm(tab.id)} style={{
                    padding: "8px 8px", borderRadius: "0 8px 8px 0", border: "none",
                    background: activeTab === tab.id ? "#1d4ed8" : "#cbd5e1",
                    color: activeTab === tab.id ? "#bfdbfe" : "#94a3b8", fontSize: 11, cursor: "pointer"
                  }}>✕</button>
                )
              )}
            </div>
          ))}

          {showAddTab ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input autoFocus value={newTabName} onChange={e => setNewTabName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addTab(); if (e.key === "Escape") setShowAddTab(false); }}
                placeholder="Group name..."
                style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #93c5fd", fontSize: 13, outline: "none", width: 140 }} />
              <button onClick={addTab} style={{ padding: "7px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add</button>
              <button onClick={() => setShowAddTab(false)} style={{ padding: "7px 10px", background: "#e2e8f0", color: "#475569", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowAddTab(true)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px dashed #93c5fd", background: "transparent", color: "#2563eb", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              + Add Position Group
            </button>
          )}

          <button onClick={() => setShowFilters(f => !f)} style={{
            marginLeft: "auto", padding: "8px 14px", borderRadius: 8,
            border: `1.5px solid ${hasActiveFilters ? "#2563eb" : "#e2e8f0"}`,
            background: hasActiveFilters ? "#dbeafe" : "#fff",
            color: hasActiveFilters ? "#1d4ed8" : "#475569",
            fontWeight: 600, fontSize: 13, cursor: "pointer"
          }}>
            {hasActiveFilters ? "🔍 Filters Active" : "🔍 Filter"}
          </button>
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em" }}>Filter:</span>
            {COLS.map(col => (
              <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{col.label}</label>
                <input value={tabFilter[col.key] || ""} onChange={e => setFilter(col.key, e.target.value)}
                  placeholder="Filter..."
                  style={{ padding: "5px 8px", border: "1.5px solid #e2e8f0", borderRadius: 6, fontSize: 12, outline: "none", width: 130 }}
                  onFocus={e => e.target.style.borderColor = "#93c5fd"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
              </div>
            ))}
            {hasActiveFilters && (
              <button onClick={() => setFilterConfig(f => ({ ...f, [activeTab]: {} }))}
                style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", alignSelf: "flex-end" }}>
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={thStyle}>Status</th>
                {COLS.map(col => (
                  <th key={col.key} style={{ ...thStyle, cursor: "pointer", userSelect: "none" }} onClick={() => setSort(col.key)}>
                    {col.label}<SortIcon col={col.key} />
                  </th>
                ))}
                <th style={thStyle}>Actions</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {activeExecs.length === 0 && inactiveExecs.length === 0 && (
                <tr><td colSpan={colCount} style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No executives yet. Click "+ Add Executive" to get started.</td></tr>
              )}
              {activeExecs.map((exec, i) => (
                <ExecRow key={exec.id} exec={exec} i={i} section="active"
                  onUpdate={updateRecord} onDelete={deleteRow}
                  deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} />
              ))}
              {inactiveExecs.length > 0 && (
                <>
                  <tr>
                    <td colSpan={colCount} style={{ padding: "8px 14px 4px", background: "#f8fafc", borderTop: "2px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em" }}>○ Inactive ({inactiveExecs.length})</span>
                    </td>
                  </tr>
                  {inactiveExecs.map((exec, i) => (
                    <ExecRow key={exec.id} exec={exec} i={i} section="inactive"
                      onUpdate={updateRecord} onDelete={deleteRow}
                      deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} />
                  ))}
                </>
              )}
            </tbody>
          </table>
          <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9" }}>
            <button onClick={addRow} style={{ padding: "7px 16px", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, color: "#2563eb", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              + Add Executive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
