const healthServices = [
  { name: "PostgreSQL", detail: "Primary data store", state: "Operational", latency: "18 ms" },
  { name: "Authentication", detail: "Session service", state: "Operational", latency: "42 ms" },
  { name: "File storage", detail: "Campus media", state: "Operational", latency: "64 ms" },
  { name: "Search", detail: "Directory index", state: "Operational", latency: "31 ms" },
];

export function SystemHealthPanel() {
  return (
    <section className="monitor-panel">
      <div className="monitor-panel-heading">
        <div><span className="monitor-kicker">SERVICE TELEMETRY</span><h2>System health</h2></div>
        <span className="monitor-live"><i /> ALL SYSTEMS NOMINAL</span>
      </div>
      <div className="health-service-list">
        {healthServices.map((service) => (
          <div className="health-service-row" key={service.name}>
            <span className="health-service-indicator" aria-hidden="true" />
            <div><strong>{service.name}</strong><small>{service.detail}</small></div>
            <span className="health-service-state">{service.state}</span>
            <code>{service.latency}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContentHealthPanel() {
  return (
    <section className="monitor-panel">
      <div className="monitor-panel-heading">
        <div><span className="monitor-kicker">PUBLISHING QUALITY</span><h2>Content health</h2></div>
        <span className="monitor-tag">MOCK AUDIT</span>
      </div>
      <div className="content-health-grid">
        <article><strong>14</strong><span>courses missing fees</span><small>Needs data review</small></article>
        <article><strong>8</strong><span>courses missing admission info</span><small>Needs data review</small></article>
        <article><strong>6</strong><span>profiles awaiting verification</span><small>Review queue</small></article>
      </div>
    </section>
  );
}

const sampleErrors = [
  { id: "ERR-9F2A", type: "DatabaseTimeout", route: "/api/explore", severity: "Warning", time: "2 min ago" },
  { id: "ERR-9F29", type: "StorageUnavailable", route: "/api/college/media", severity: "Critical", time: "18 min ago" },
  { id: "ERR-9F28", type: "InvalidPayload", route: "/api/auth/register", severity: "Warning", time: "42 min ago" },
];

export function ErrorsTable() {
  return (
    <div className="monitor-table-wrap">
      <table className="monitor-table">
        <thead><tr><th>ID</th><th>Type</th><th>Page / API</th><th>Severity</th><th>Time</th></tr></thead>
        <tbody>
          {sampleErrors.map((error) => (
            <tr key={error.id}>
              <td><code>{error.id}</code></td>
              <td>{error.type}</td>
              <td><code>{error.route}</code></td>
              <td><span className={`severity-badge severity-${error.severity.toLowerCase()}`}>{error.severity}</span></td>
              <td>{error.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="monitor-disclaimer">Sample events for dashboard layout only. Live error ingestion is not connected.</p>
    </div>
  );
}
