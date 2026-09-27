import Link from "next/link";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  await requireUser(["PLATFORM_ADMIN"]);
  const entries = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { actor: { select: { name: true, email: true } } } });
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/admin"><span className="brand-mark">c</span><span>collytex</span></Link><div className="header-actions"><Link className="login-link" href="/admin">Admin overview</Link></div></header><div className="account-content"><div className="eyebrow">PLATFORM ADMINISTRATION</div><h1>Audit log</h1><p>Recent organization and platform changes.</p>{entries.length ? <div className="audit-list">{entries.map((entry) => <article key={entry.id}><div><b>{entry.action.replaceAll("_", " ").toLowerCase()}</b><span>{entry.entityType} · {entry.entityId}</span><small>{entry.actor?.name ?? "System"}{entry.actor?.email ? ` · ${entry.actor.email}` : ""}</small></div><time dateTime={entry.createdAt.toISOString()}>{entry.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time></article>)}</div> : <div className="empty-state"><div><strong>No audit actions have been recorded yet.</strong></div></div>}<Link className="back-link" href="/admin">← Admin overview</Link></div></main>;
}
