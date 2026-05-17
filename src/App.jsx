import { useState, useEffect, useCallback } from "react";

const SPACES = [
  { id: "home", label: "Home", icon: "🏡", color: "#D4A88C" },
  { id: "glimpse", label: "Glimpse of Science", icon: "✨", color: "#C9A0DC" },
  { id: "moroccan-minds", label: "Moroccan Minds", icon: "🎙️", color: "#E8B4B8" },
  { id: "stellantis", label: "Stellantis", icon: "🚀", color: "#A8C5DA" },
  { id: "reply", label: "Data Reply", icon: "💼", color: "#B8D4BE" },
  { id: "ambassador", label: "Mistral Ambassador", icon: "⭐", color: "#F0C987" },
  { id: "personal", label: "Chez Moi", icon: "🕯️", color: "#E0C8B0" },
  { id: "travel", label: "Travel", icon: "✈️", color: "#A8D8EA" },
  { id: "wishlist", label: "Wish Lists", icon: "🎀", color: "#F2B5D4" },
];

const STORAGE_KEY = "soukaina-life-os-data";

const defaultData = {
  home: { tasks: [], notes: "" },
  glimpse: {
    tasks: [
      { id: "g1", text: "SAA prep video — script & outline", done: false, priority: "high" },
      { id: "g2", text: "Instagram handle migration → 'drafted'", done: false, priority: "medium" },
      { id: "g3", text: "Plan next Reels batch (3 topics)", done: false, priority: "medium" },
    ],
    notes: "",
  },
  "moroccan-minds": {
    tasks: [
      { id: "mm1", text: "Community gathering — finalize date & venue", done: false, priority: "high" },
      { id: "mm2", text: "YouTube monetization checklist", done: false, priority: "medium" },
      { id: "mm3", text: "Guest outreach — next 3 episodes", done: false, priority: "medium" },
    ],
    notes: "",
  },
  stellantis: {
    tasks: [
      { id: "s1", text: "MCP Server integration — ServiceNow", done: false, priority: "high" },
      { id: "s2", text: "Agent Gateway architecture doc", done: false, priority: "high" },
      { id: "s3", text: "Prompt & Skills Registry — first draft", done: false, priority: "medium" },
    ],
    notes: "",
  },
  reply: {
    tasks: [
      { id: "r1", text: "Consultant 2 promotion — prep evidence", done: false, priority: "high" },
      { id: "r2", text: "Kiro Pro testing — feedback to Alessandro", done: false, priority: "medium" },
    ],
    notes: "",
  },
  ambassador: {
    tasks: [
      { id: "a1", text: "Next speaking engagement — prep slides", done: false, priority: "medium" },
      { id: "a2", text: "Community event brainstorm", done: false, priority: "low" },
    ],
    notes: "",
  },
  personal: {
    tasks: [
      { id: "p1", text: "Apartment — finalize lease start date", done: true, priority: "high" },
      { id: "p2", text: "Moving checklist (EDF, internet, CAF)", done: false, priority: "high" },
      { id: "p3", text: "Italian practice — daily streak", done: false, priority: "medium" },
    ],
    notes: "",
  },
  travel: {
    tasks: [
      { id: "t1", text: "Vienna & Budapest — Dec/Jan itinerary", done: false, priority: "high" },
      { id: "t2", text: "Research halal restaurants in Vienna", done: false, priority: "medium" },
      { id: "t3", text: "Book Flixbus/train — compare prices", done: false, priority: "medium" },
    ],
    notes: "",
  },
  wishlist: {
    tasks: [
      { id: "w1", text: "Aerial hoop classes — find studio near new apartment", done: false, priority: "medium" },
      { id: "w2", text: "New camera lens for content creation", done: false, priority: "low" },
    ],
    notes: "",
  },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultData;
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

/* ── Reusable Components ── */

function ProgressRing({ done, total, color, size = 72 }) {
  const pct = total === 0 ? 0 : done / total;
  const r = size * 0.39, stroke = size * 0.07, circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill="#5a4a42" fontSize={size * 0.2} fontWeight={600}
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
        fontFamily="'DM Sans', sans-serif">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);
  const priorityColors = { high: "#E07A7A", medium: "#F0C987", low: "#B8D4BE" };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
      background: task.done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)",
      borderRadius: 12, marginBottom: 6, transition: "all 0.25s ease",
      borderLeft: `4px solid ${priorityColors[task.priority] || "#ccc"}`,
      opacity: task.done ? 0.55 : 1,
    }}>
      <button onClick={() => onToggle(task.id)} style={{
        width: 22, height: 22, borderRadius: "50%", border: `2px solid ${priorityColors[task.priority]}`,
        background: task.done ? priorityColors[task.priority] : "transparent", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        fontSize: 12, color: "#fff", transition: "all 0.2s",
      }}>
        {task.done && "✓"}
      </button>
      {editing ? (
        <input value={text} onChange={e => setText(e.target.value)}
          onBlur={() => { onEdit(task.id, text); setEditing(false); }}
          onKeyDown={e => { if (e.key === "Enter") { onEdit(task.id, text); setEditing(false); } }}
          autoFocus style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#5a4a42",
          }}
        />
      ) : (
        <span onClick={() => setEditing(true)} style={{
          flex: 1, fontSize: 14, color: "#5a4a42", cursor: "text",
          textDecoration: task.done ? "line-through" : "none",
          fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4,
        }}>{task.text}</span>
      )}
      <button onClick={() => onDelete(task.id)} style={{
        background: "none", border: "none", cursor: "pointer", fontSize: 14,
        color: "#c4a898", opacity: 0.5, padding: 4, transition: "opacity 0.2s",
      }} onMouseEnter={e => e.target.style.opacity = 1}
         onMouseLeave={e => e.target.style.opacity = 0.5}>✕</button>
    </div>
  );
}

function AddTask({ onAdd }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [open, setOpen] = useState(false);

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      width: "100%", padding: "11px", border: "2px dashed rgba(180,160,150,0.25)",
      borderRadius: 12, background: "transparent", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#b4a098",
      transition: "all 0.2s",
    }}>+ Add task</button>
  );

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="What needs doing?"
        onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd(text, priority); setText(""); setOpen(false); } }}
        autoFocus style={{
          flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 12,
          border: "1px solid rgba(180,160,150,0.25)", background: "rgba(255,255,255,0.6)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#5a4a42", outline: "none",
        }}
      />
      <select value={priority} onChange={e => setPriority(e.target.value)} style={{
        padding: "9px 8px", borderRadius: 8, border: "1px solid rgba(180,160,150,0.25)",
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, background: "rgba(255,255,255,0.6)", color: "#5a4a42",
      }}>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>
      <button onClick={() => { if (text.trim()) { onAdd(text, priority); setText(""); setOpen(false); } }} style={{
        padding: "9px 16px", borderRadius: 10, border: "none", background: "#D4A88C",
        color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
      }}>Add</button>
      <button onClick={() => setOpen(false)} style={{
        padding: "9px 12px", borderRadius: 10, border: "none", background: "rgba(0,0,0,0.05)",
        color: "#9a8a82", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
      }}>Cancel</button>
    </div>
  );
}

function NotesSection({ notes, onChange }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 13, color: "#b4a098", marginBottom: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
        📝 Quick Notes
      </div>
      <textarea value={notes} onChange={e => onChange(e.target.value)} placeholder="Jot something down..."
        style={{
          width: "100%", minHeight: 90, padding: 14, borderRadius: 14,
          border: "1px solid rgba(180,160,150,0.15)", background: "rgba(255,255,255,0.5)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#5a4a42",
          outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function AiChat({ space }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are Soukaina's personal AI assistant inside her Life OS dashboard. You're in the "${space}" space. Be warm, concise, and actionable. Respond in English unless she writes in French or Darija. Keep responses short (3-5 sentences max).`,
          messages: [{ role: "user", content: input }],
        }),
      });
      const data = await res.json();
      setResponse(data.content?.map(b => b.text || "").filter(Boolean).join("\n") || "No response.");
    } catch {
      setResponse("Couldn't reach Claude right now — try again in a moment 💫");
    }
    setLoading(false);
  };

  return (
    <div style={{
      marginTop: 20, padding: 18, borderRadius: 16,
      background: "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,240,235,0.35))",
      border: "1px solid rgba(212,168,140,0.15)",
    }}>
      <div style={{ fontSize: 13, color: "#b4a098", marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
        ✨ Ask Claude anything about this space
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="e.g. 'What should I prioritize this week?'"
          onKeyDown={e => { if (e.key === "Enter") handleAsk(); }}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 12,
            border: "1px solid rgba(180,160,150,0.15)", background: "rgba(255,255,255,0.65)",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#5a4a42", outline: "none",
          }}
        />
        <button onClick={handleAsk} disabled={loading} style={{
          padding: "10px 20px", borderRadius: 12, border: "none",
          background: loading ? "#e0d5cf" : "linear-gradient(135deg, #D4A88C, #C9A0DC)",
          color: "#fff", cursor: loading ? "wait" : "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          transition: "all 0.2s",
        }}>
          {loading ? "✦✦✦" : "Ask"}
        </button>
      </div>
      {response && (
        <div style={{
          marginTop: 12, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.5)",
          fontSize: 14, color: "#5a4a42", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "pre-wrap",
        }}>{response}</div>
      )}
    </div>
  );
}

/* ── Main App ── */

export default function App() {
  const [activeSpace, setActiveSpace] = useState("home");
  const [data, setData] = useState(loadData);
  const [now, setNow] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const space = SPACES.find(s => s.id === activeSpace);
  const spaceData = data[activeSpace] || { tasks: [], notes: "" };

  const updateSpace = useCallback((id, updater) => {
    setData(prev => ({ ...prev, [id]: updater(prev[id] || { tasks: [], notes: "" }) }));
  }, []);

  const toggleTask = (taskId) => updateSpace(activeSpace, s => ({
    ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
  }));
  const deleteTask = (taskId) => updateSpace(activeSpace, s => ({
    ...s, tasks: s.tasks.filter(t => t.id !== taskId),
  }));
  const editTask = (taskId, text) => updateSpace(activeSpace, s => ({
    ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, text } : t),
  }));
  const addTask = (text, priority) => updateSpace(activeSpace, s => ({
    ...s, tasks: [...s.tasks, { id: `t${Date.now()}`, text, done: false, priority }],
  }));
  const updateNotes = (notes) => updateSpace(activeSpace, s => ({ ...s, notes }));

  const totalTasks = Object.values(data).reduce((a, s) => a + (s.tasks?.length || 0), 0);
  const doneTasks = Object.values(data).reduce((a, s) => a + (s.tasks?.filter(t => t.done).length || 0), 0);

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const navigateTo = (id) => {
    setActiveSpace(id);
    setMobileMenuOpen(false);
  };

  /* ── Home View ── */
  const renderHome = () => (
    <div>
      <div style={{
        padding: "28px 24px", borderRadius: 20, marginBottom: 20,
        background: "linear-gradient(135deg, rgba(212,168,140,0.15), rgba(201,160,220,0.12), rgba(232,180,184,0.1))",
        border: "1px solid rgba(212,168,140,0.12)",
      }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? 22 : 28, color: "#5a4a42", fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
          {greeting()}, Soukaina ☀️
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#9a8a82", fontFamily: "'DM Sans', sans-serif" }}>
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div style={{
          padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(212,168,140,0.12)", display: "flex", alignItems: "center", gap: 16,
        }}>
          <ProgressRing done={doneTasks} total={totalTasks} color="#D4A88C" />
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#5a4a42" }}>{doneTasks}/{totalTasks}</div>
            <div style={{ fontSize: 13, color: "#b4a098" }}>tasks complete</div>
          </div>
        </div>
        <div style={{
          padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(212,168,140,0.12)",
        }}>
          <div style={{ fontSize: 13, color: "#b4a098", marginBottom: 8 }}>🔥 High priority</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#E07A7A" }}>
            {Object.values(data).reduce((a, s) => a + (s.tasks?.filter(t => !t.done && t.priority === "high").length || 0), 0)}
          </div>
          <div style={{ fontSize: 13, color: "#b4a098" }}>tasks need attention</div>
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: "#5a4a42", marginBottom: 12 }}>Across all spaces</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10 }}>
        {SPACES.filter(s => s.id !== "home").map(s => {
          const sd = data[s.id] || { tasks: [] };
          const d = sd.tasks?.filter(t => t.done).length || 0;
          const tot = sd.tasks?.length || 0;
          return (
            <button key={s.id} onClick={() => navigateTo(s.id)} style={{
              padding: 16, borderRadius: 14, border: "1px solid rgba(212,168,140,0.1)",
              background: "rgba(255,255,255,0.45)", cursor: "pointer", textAlign: "left",
              transition: "all 0.25s ease", fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#5a4a42" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#b4a098", marginTop: 4 }}>{d}/{tot} done</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${tot ? (d / tot) * 100 : 0}%`, background: s.color,
                  borderRadius: 2, transition: "width 0.5s ease",
                }} />
              </div>
            </button>
          );
        })}
      </div>

      <AiChat space="home" />
    </div>
  );

  /* ── Space View ── */
  const renderSpace = () => {
    const done = spaceData.tasks?.filter(t => t.done).length || 0;
    const total = spaceData.tasks?.length || 0;
    return (
      <div>
        <div style={{
          display: "flex", alignItems: "center", gap: 14, marginBottom: 22,
          padding: 20, borderRadius: 18,
          background: `linear-gradient(135deg, ${space.color}18, ${space.color}0A)`,
          border: `1px solid ${space.color}1A`,
        }}>
          <div style={{ fontSize: 38 }}>{space.icon}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, color: "#5a4a42", fontFamily: "'Playfair Display', serif" }}>
              {space.label}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9a8a82" }}>{done}/{total} tasks complete</p>
          </div>
          <ProgressRing done={done} total={total} color={space.color} size={isMobile ? 60 : 72} />
        </div>

        <div style={{ marginBottom: 16 }}>
          {(spaceData.tasks || []).filter(t => !t.done).map(t => (
            <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
          ))}
          {(spaceData.tasks || []).filter(t => t.done).length > 0 && (
            <>
              <div style={{
                fontSize: 11, color: "#b4a098", marginTop: 16, marginBottom: 8,
                textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 500,
              }}>Completed</div>
              {(spaceData.tasks || []).filter(t => t.done).map(t => (
                <TaskItem key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
              ))}
            </>
          )}
        </div>

        <AddTask onAdd={addTask} />
        <NotesSection notes={spaceData.notes || ""} onChange={updateNotes} />
        <AiChat space={activeSpace} />
      </div>
    );
  };

  /* ── Layout ── */
  return (
    <div style={{
      display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif",
      background: "linear-gradient(160deg, #FFF8F5 0%, #FDF2ED 30%, #F8EDE8 60%, #F5EAE4 100%)",
    }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,248,245,0.92)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(212,168,140,0.1)",
        }}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#5a4a42", padding: 4,
          }}>☰</button>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#5a4a42", fontFamily: "'Playfair Display', serif" }}>
            {space.icon} {space.label}
          </span>
          <div style={{ width: 30 }} />
        </div>
      )}

      {/* Mobile overlay menu */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(90,74,66,0.3)", backdropFilter: "blur(4px)",
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            width: 260, height: "100%", background: "rgba(255,248,245,0.97)",
            padding: "20px 14px", overflowY: "auto",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#5a4a42", fontFamily: "'Playfair Display', serif", padding: "10px 10px 20px" }}>
              my life os
            </div>
            {SPACES.map(s => {
              const active = activeSpace === s.id;
              return (
                <button key={s.id} onClick={() => navigateTo(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: active ? `${s.color}22` : "transparent", marginBottom: 2,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? "#5a4a42" : "#9a8a82" }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={{
          width: sidebarOpen ? 230 : 64, transition: "width 0.3s ease", overflow: "hidden",
          borderRight: "1px solid rgba(212,168,140,0.1)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,248,245,0.25))",
          display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
          <div style={{
            padding: sidebarOpen ? "26px 20px 18px" : "26px 10px 18px",
            display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center",
          }}>
            {sidebarOpen && (
              <span style={{ fontSize: 19, fontWeight: 700, color: "#5a4a42", fontFamily: "'Playfair Display', serif", letterSpacing: -0.5 }}>
                my life os
              </span>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#b4a098", padding: 4,
              transition: "color 0.2s",
            }}>
              {sidebarOpen ? "◁" : "▷"}
            </button>
          </div>

          <div style={{ flex: 1, padding: sidebarOpen ? "0 10px" : "0 6px" }}>
            {SPACES.map(s => {
              const active = activeSpace === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSpace(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 11, width: "100%",
                  padding: sidebarOpen ? "10px 14px" : "10px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: 12, border: "none", cursor: "pointer", marginBottom: 2,
                  background: active ? `${s.color}22` : "transparent",
                  transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
                }}>
                  <span style={{ fontSize: 19 }}>{s.icon}</span>
                  {sidebarOpen && (
                    <span style={{
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      color: active ? "#5a4a42" : "#9a8a82",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{s.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {sidebarOpen && (
            <div style={{ padding: "16px 20px", fontSize: 11, color: "#c4b8b0", borderTop: "1px solid rgba(212,168,140,0.08)" }}>
              made with 💕
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div style={{
        flex: 1, padding: isMobile ? "64px 16px 24px" : "30px 36px",
        maxWidth: 740, overflowY: "auto",
        margin: isMobile ? 0 : undefined,
      }}>
        {activeSpace === "home" ? renderHome() : renderSpace()}
      </div>
    </div>
  );
}
