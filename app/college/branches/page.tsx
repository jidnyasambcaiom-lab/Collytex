import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const user = await requireUser(["COLLEGE_HEAD", "COLLEGE_BRANCH"]);
  if (user.role === "COLLEGE_BRANCH" && user.branchId) redirect(`/college/branches/${user.branchId}`);
  const branches = await prisma.branch.findMany({ where: { collegeId: user.collegeId ?? "" }, orderBy: { name: "asc" } });
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/college"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/college">Dashboard</Link><Link href="/college/branches">Branches</Link></nav></header><div className="account-content"><div className="eyebrow">YOUR ORGANIZATION</div><h1>Branches</h1><div className="account-section-heading"><h2>Campuses</h2><Link className="text-link" href="/college/branches/new">Add a campus +</Link></div><div className="directory-list">{branches.map((branch) => <article className="directory-card" key={branch.id}><div className="directory-card-top"><div><span className="verified-label">{branch.isApproved ? "APPROVED" : "PENDING APPROVAL"}</span><h2>{branch.name}</h2><p className="branch-location">{branch.city}, {branch.state}</p></div><Link className="text-link" href={`/college/branches/${branch.id}`}>Manage ↗</Link></div></article>)}</div></div></main>;
}
