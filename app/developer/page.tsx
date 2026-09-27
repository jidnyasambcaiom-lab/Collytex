import { ContentHealthPanel, SystemHealthPanel } from "@/components/developer-health-panels";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function loadOverview() {
  const startedAt = performance.now();
  try {
    const [users, colleges, courses] = await Promise.all([
      prisma.user.count(),
      prisma.college.count(),
      prisma.course.count(),
    ]);
    await prisma.$queryRaw`SELECT 1`;
    return { users, colleges, courses, responseMs: Math.round(performance.now() - startedAt), databaseHealthy: true };
  } catch {
    return { users: null, colleges: null, courses: null, responseMs: null, databaseHealthy: false };
  }
}

function metric(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
}

export default async function DeveloperOverviewPage() {
  const overview = await loadOverview();

  return (
    <div className="developer-content">
      <header className="developer-page-header">
        <div><span className="monitor-kicker">SYSTEM OVERVIEW / PROD</span><h1>Control plane</h1><p>Platform telemetry and operational signals.</p></div>
        <div className="developer-updated"><span>LAST UPDATED</span><code>{new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</code><span className="monitor-live"><i /> LIVE</span></div>
      </header>

      <section className="developer-kpi-grid" aria-label="Platform metrics">
        <article className="developer-kpi"><span>USERS</span><strong>{metric(overview.users)}</strong><small>Registered accounts</small></article>
        <article className="developer-kpi"><span>COLLEGES</span><strong>{metric(overview.colleges)}</strong><small>Directory records</small></article>
        <article className="developer-kpi"><span>COURSES</span><strong>{metric(overview.courses)}</strong><small>Published catalogue</small></article>
        <article className="developer-kpi"><span>DATABASE</span><strong className={overview.databaseHealthy ? "metric-positive" : "metric-negative"}>{overview.databaseHealthy ? "HEALTHY" : "OFFLINE"}</strong><small>{overview.responseMs === null ? "Response unavailable" : `${overview.responseMs} ms response`}</small></article>
        <article className="developer-kpi"><span>STORAGE</span><strong>68.4 GB</strong><small>of 100 GB · illustrative</small></article>
        <article className="developer-kpi"><span>SYSTEM ERRORS</span><strong>03</strong><small>Sample events · last hour</small></article>
      </section>

      <div className="developer-panel-grid">
        <SystemHealthPanel />
        <ContentHealthPanel />
      </div>
      {!overview.databaseHealthy && <p className="developer-alert" role="status">Database metrics are unavailable. Check the configured database connection; placeholder health is not shown as a success state.</p>}
      <footer className="developer-footer"><span>COLLYTEX SYSTEMS</span><span>READ-ONLY TELEMETRY VIEW</span><code>ENV: PRODUCTION</code></footer>
    </div>
  );
}
