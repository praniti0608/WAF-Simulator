import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API, { autoConnect: false });

const attackTypes = [
  { key: "SQL_INJECTION", label: "SQL Injection", icon: "SQL", cls: "sql" },
  { key: "XSS", label: "Cross-Site Scripting", icon: "XSS", cls: "xss" },
  { key: "PATH_TRAVERSAL", label: "Path Traversal", icon: "PT", cls: "path" },
];

const demoPayloads = {
  SQL_INJECTION: "1 OR 1=1",
  XSS: "<script>alert(1)</script>",
  PATH_TRAVERSAL: "../../etc/passwd",
};

function App() {
  const [stats, setStats] = useState(null);
  const [attacks, setAttacks] = useState([]);
  const [rules, setRules] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [testing, setTesting] = useState(false);

  const loadDashboard = async () => {
    try {
      const [s, a, r] = await Promise.all([
        axios.get(`${API}/api/dashboard/stats`),
        axios.get(`${API}/api/dashboard/attacks?limit=50`),
        axios.get(`${API}/api/dashboard/rules`),
      ]);
      setStats(s.data.stats);
      setAttacks(a.data.attacks || []);
      setRules(r.data.rules || []);
    } catch (err) {
      setToast(`Backend unavailable: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    socket.connect();
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("attack:blocked", (attack) => {
      setAttacks((old) => [attack, ...old].slice(0, 50));
      setStats((old) => old ? {
        ...old,
        total: old.total + 1,
        blocked: old.blocked + 1,
        sqlInjection: old.sqlInjection + (attack.attackType === "SQL_INJECTION" ? 1 : 0),
        xss: old.xss + (attack.attackType === "XSS" ? 1 : 0),
        pathTraversal: old.pathTraversal + (attack.attackType === "PATH_TRAVERSAL" ? 1 : 0),
        critical: old.critical + (attack.severity === "CRITICAL" ? 1 : 0),
        high: old.high + (attack.severity === "HIGH" ? 1 : 0),
      } : old);
      setToast(`Blocked ${attack.attackType.replaceAll("_", " ")}`);
      window.setTimeout(() => setToast(""), 3000);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("attack:blocked");
      socket.disconnect();
    };
  }, []);

  const filteredAttacks = useMemo(
    () => filter === "ALL" ? attacks : attacks.filter((a) => a.attackType === filter),
    [attacks, filter]
  );

  const fireAttack = async (type) => {
    setTesting(true);
    const payload = demoPayloads[type];
    try {
      if (type === "SQL_INJECTION") {
        await axios.get(`${API}/api/demo/search`, { params: { q: payload } });
      } else if (type === "XSS") {
        await axios.post(`${API}/api/demo/comment`, { comment: payload });
      } else {
        await axios.get(`${API}/api/demo/file`, { params: { name: payload } });
      }
    } catch (err) {
      if (err.response?.status !== 403) {
        setToast(`Test failed: ${err.message}`);
        window.setTimeout(() => setToast(""), 3000);
      }
    } finally {
      setTesting(false);
    }
  };

  const safeRequest = async () => {
    try {
      await axios.get(`${API}/api/demo/search`, { params: { q: "hello world" } });
      setToast("Safe request passed through the WAF.");
    } catch (err) {
      setToast(`Unexpected error: ${err.message}`);
    }
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <strong>WAF Sentinel</strong>
            <span>Security Simulator</span>
          </div>
        </div>

        <nav>
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#live">Live Attacks</a>
          <a href="#rules">Detection Rules</a>
          <a href="#demo">Attack Simulator</a>
        </nav>

        <div className="side-card">
          <span className={`status-dot ${connected ? "online" : ""}`}></span>
          <div>
            <b>{connected ? "Live protection online" : "Connecting..."}</b>
            <small>Socket.IO event stream</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">ENTERPRISE SECURITY LAB</p>
            <h1>Web Application Firewall</h1>
            <p className="subtitle">Real-time signature detection and attack telemetry</p>
          </div>
          <button className="ghost-btn" onClick={loadDashboard}>↻ Refresh</button>
        </header>

        {toast && <div className="toast">{toast}</div>}

        <section id="dashboard" className="stats-grid">
          <Stat title="Total Attacks" value={stats?.total ?? 0} note="Recorded in MongoDB" />
          <Stat title="Blocked Requests" value={stats?.blocked ?? 0} note="HTTP 403 responses" />
          <Stat title="High / Critical" value={(stats?.high ?? 0) + (stats?.critical ?? 0)} note="Elevated severity" />
          <Stat title="Detection Rules" value={rules.length} note="Active signatures" />
        </section>

        <section className="content-grid">
          <div className="panel attack-panel" id="live">
            <div className="panel-head">
              <div>
                <h2>Live Attack Stream</h2>
                <p>Blocked requests appear here instantly.</p>
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">All attacks</option>
                <option value="SQL_INJECTION">SQL Injection</option>
                <option value="XSS">XSS</option>
                <option value="PATH_TRAVERSAL">Path Traversal</option>
              </select>
            </div>

            <div className="attack-list">
              {loading && <div className="empty">Loading telemetry...</div>}
              {!loading && filteredAttacks.length === 0 && (
                <div className="empty">No blocked attacks yet. Use the simulator on the right.</div>
              )}
              {filteredAttacks.map((attack, i) => (
                <AttackRow key={attack.requestId || i} attack={attack} />
              ))}
            </div>
          </div>

          <div className="right-column">
            <div className="panel" id="demo">
              <div className="panel-head">
                <div>
                  <h2>Attack Simulator</h2>
                  <p>Safe local test payloads for your demo endpoint.</p>
                </div>
              </div>
              <div className="sim-grid">
                {attackTypes.map((type) => (
                  <button
                    className={`sim-card ${type.cls}`}
                    key={type.key}
                    disabled={testing}
                    onClick={() => fireAttack(type.key)}
                  >
                    <span className="sim-icon">{type.icon}</span>
                    <span>
                      <b>{type.label}</b>
                      <small>{demoPayloads[type.key]}</small>
                    </span>
                    <span className="arrow">→</span>
                  </button>
                ))}
                <button className="safe-card" onClick={safeRequest}>
                  <span className="sim-icon safe">OK</span>
                  <span><b>Safe Request</b><small>hello world</small></span>
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>

            <div className="panel" id="rules">
              <div className="panel-head">
                <div>
                  <h2>Detection Rules</h2>
                  <p>Regex-based signatures currently loaded.</p>
                </div>
              </div>
              <div className="rules">
                {rules.map((rule) => (
                  <div className="rule" key={rule.ruleId}>
                    <span className="rule-id">{rule.ruleId}</span>
                    <span>{rule.type.replaceAll("_", " ")}</span>
                    <span className={`severity ${rule.severity.toLowerCase()}`}>{rule.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer>
          <span>WAF Simulator • React + Express + Socket.IO + MongoDB</span>
          <span>For authorized local security demonstrations only.</span>
        </footer>
      </main>
    </div>
  );
}

function Stat({ title, value, note }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function AttackRow({ attack }) {
  const label = attack.attackType.replaceAll("_", " ");
  return (
    <div className="attack-row">
      <div className={`attack-badge ${attack.attackType.toLowerCase()}`}>
        {attack.attackType === "SQL_INJECTION" ? "SQL" : attack.attackType === "PATH_TRAVERSAL" ? "PT" : "XSS"}
      </div>
      <div className="attack-main">
        <div className="attack-title">
          <b>{label}</b>
          <span className={`severity ${attack.severity?.toLowerCase()}`}>{attack.severity}</span>
        </div>
        <span>{attack.method} {attack.endpoint}</span>
        <small>Rule {attack.ruleId} • Field {attack.matchedField || "unknown"}</small>
      </div>
      <div className="blocked">BLOCKED</div>
      <time>{attack.timestamp ? new Date(attack.timestamp).toLocaleTimeString() : "now"}</time>
    </div>
  );
}

export default App;
