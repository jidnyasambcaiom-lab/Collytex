import { notFound } from "next/navigation";
import { ContentHealthPanel, ErrorsTable, SystemHealthPanel } from "@/components/developer-health-panels";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const sections: Record<string, { title: string; description: string }> = {
  users: { title: "Users", description: "Account activity and identity records." },
  colleges: { title: "Colleges", description: "Institution directory and verification pipeline." },
  content: { title: "Content health", description: "Completeness signals for published course records." },
  database: { title: "Database", description: "Read-only connection telemetry and table counts." },
  analytics: { title: "Analytics", description: "Traffic and discovery activity signals." },
  activity: { title: "Activity", description: "Recent platform events." },
  security: { title: "Security", description: "Authentication and access monitoring." },
  errors: { title: "Errors", description: "Recent application error events." },
  storage: { title: "Storage", description: "File storage capacity and delivery status." },
  system: { title: "System", description: "Service health and runtime details." },
  settings: { title: "Settings", description: "Control-plane configuration." },
};

async function loadDatabaseStatus() {
  const startedAt = performance.now();
  try {
    const [users, colleges, courses] = await Promise.all([
      prisma.user.count(),
      prisma.college.count(),
      prisma.course.count(),
    ]);
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, responseMs: Math.round(performance.now() - startedAt), users, colleges, courses };
  } catch {
    return { connected: false, responseMs: null, users: null, colleges: null, courses: null };
  }
}

export default async function DeveloperSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const config = sections[section];
  if (!config) notFound();

  if (section === "database") {
    const db = await loadDatabaseStatus();
    return (
      <div className="developer-content">
        <header className="developer-page-header"><div><span className="monitor-kicker">SYSTEM / DATABASE</span><h1>{config.title}</h1><p>{config.description}</p></div><span className={`monitor-status-pill ${db.connected ? "is-online" : "is-offline"}`}><i />{db.connected ? "CONNECTED" : "UNAVAILABLE"}</span></header>
        <section className="developer-kpi-grid developer-kpi-grid-compact">
          <article className="developer-kpi"><span>ENGINE</span><strong>PostgreSQL</strong><small>Remote database</small></article>
          <article className="developer-kpi"><span>CONNECTION</span><strong className={db.connected ? "metric-positive" : "metric-negative"}>{db.connected ? "HEALTHY" : "FAILED"}</strong><small>SELECT 1 probe</small></article>
          <article className="developer-kpi"><span>RESPONSE TIME</span><strong>{db.responseMs === null ? "—" : `${db.responseMs} ms`}</strong><small>Measured for this request</small></article>
        </section>
        <section className="monitor-panel"><div className="monitor-panel-heading"><div><span className="monitor-kicker">READ ONLY</span><h2>Table row counts</h2></div><span className="monitor-tag">LIVE QUERY</span></div><div className="monitor-table-wrap"><table className="monitor-table"><thead><tr><th>Table</th><th>Rows</th><th>State</th></tr></thead><tbody>{[{ label: "Users", count: db.users }, { label: "Colleges", count: db.colleges }, { label: "Courses", count: db.courses }].map(({ label, count }) => <tr key={label}><td>{label}</td><td><code>{count === null ? "Unavailable" : count.toLocaleString("en-US")}</code></td><td><span className={`severity-badge ${db.connected ? "severity-healthy" : "severity-critical"}`}>{db.connected ? "Readable" : "Unavailable"}</span></td></tr>)}</tbody></table></div>{!db.connected && <p className="developer-alert">Database query failed. Counts are unavailable; no fallback values are presented as live data.</p>}</section>
        <p className="monitor-disclaimer">Read-only status page. No database mutation or reset operations are available.</p>
      </div>
    );
  }

  return (
    <div className="developer-content">
      <header className="developer-page-header"><div><span className="monitor-kicker">CONTROL PLANE / {section.toUpperCase()}</span><h1>{config.title}</h1><p>{config.description}</p></div><span className="monitor-tag">MONITORING</span></header>
      {section === "content" ? <ContentHealthPanel /> : null}
      {section === "system" ? <SystemHealthPanel /> : null}
      {section === "errors" ? <section className="monitor-panel"><div className="monitor-panel-heading"><div><span className="monitor-kicker">EVENT STREAM</span><h2>Recent errors</h2></div><span className="monitor-tag">SAMPLE DATA</span></div><ErrorsTable /></section> : null}
      {section !== "content" && section !== "system" && section !== "errors" && (
        <section className="monitor-panel">
          <div className="monitor-panel-heading"><div><span className="monitor-kicker">SERVICE MODULE</span><h2>{config.title} monitor</h2></div><span className="monitor-tag">READ ONLY</span></div>
          <p className="monitor-placeholder">This section is scaffolded for the control-plane interface. Connect a verified telemetry source before presenting live records here.</p>
        </section>
      )}
    </div>
  );
}
