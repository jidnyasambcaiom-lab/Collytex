import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-state";
import { findPresentationBranch } from "@/lib/presentation-colleges";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BranchPage({ params }: { params: Promise<{ collegeSlug: string; branchSlug: string }> }) {
  const { collegeSlug, branchSlug } = await params;
  const presentationBranch = findPresentationBranch(collegeSlug, branchSlug);
  let branch = null;
  let databaseUnavailable = false;

  try {
    branch = await prisma.branch.findFirst({
      where: { slug: branchSlug, isApproved: true, college: { slug: collegeSlug, verificationStatus: "VERIFIED" } },
      include: {
        college: true,
        departments: {
          orderBy: { name: "asc" },
          include: { offerings: { include: { university: true, courses: { orderBy: { name: "asc" } } } } },
        },
      },
    });
  } catch {
    databaseUnavailable = true;
  }

  if (databaseUnavailable && !presentationBranch) return <DatabaseUnavailable />;
  if (branch) {
    if (branch.departments.length === 1) redirect(`/colleges/${collegeSlug}/${branchSlug}/${branch.departments[0].slug}`);
    return (
      <main className="directory-page">
        <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
        <div className="profile-content">
          <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><Link href={`/colleges/${collegeSlug}`}>{branch.college.name}</Link><span>/</span><span>{branch.name}</span></div>
          <div className="eyebrow">CAMPUS</div><h1>{branch.name}</h1>
          <p className="profile-description">{branch.city}, {branch.state}{branch.address ? ` · ${branch.address}` : ""}</p>
          <div className="profile-detail-row"><span>Branch information and department pathways</span>{branch.college.website && <a href={branch.college.website} target="_blank" rel="noreferrer">College contact ↗</a>}</div>
          <div className="account-section-heading"><h2>Departments</h2><span>{branch.departments.length}</span></div>
          <div className="directory-list">{branch.departments.map((department) => <article className="directory-card" key={department.id}><div className="directory-card-top"><div><span className="verified-label">DEPARTMENT</span><h2>{department.name}</h2><p className="branch-location">{department.offerings.length} university affiliations</p></div><Link className="text-link" href={`/colleges/${collegeSlug}/${branchSlug}/${department.slug}`}>Explore department <span>↗</span></Link></div></article>)}</div>
          <Link className="back-link" href={`/colleges/${collegeSlug}`}>← {branch.college.name}</Link>
        </div>
      </main>
    );
  }

  if (!presentationBranch) notFound();
  if (presentationBranch.departments.length === 1) redirect(`/colleges/${collegeSlug}/${branchSlug}/${presentationBranch.departments[0].slug}`);

  return (
    <main className="directory-page">
      <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
      <div className="profile-content">
        <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><Link href={`/colleges/${collegeSlug}`}>{presentationBranch.displayName ?? collegeSlug}</Link><span>/</span><span>{presentationBranch.name}</span></div>
        <div className="eyebrow">CAMPUS</div><h1>{presentationBranch.name}</h1>
        <p className="profile-description">{presentationBranch.city}, {presentationBranch.state} · {presentationBranch.address}</p>
        <div className="profile-detail-row"><span>Branch information and department pathways</span>{presentationBranch.contactUrl && <a href={presentationBranch.contactUrl} target="_blank" rel="noreferrer">College contact ↗</a>}</div>
        <div className="account-section-heading"><h2>Departments</h2><span>{presentationBranch.departments.length}</span></div>
        <div className="directory-list">{presentationBranch.departments.map((department) => <article className="directory-card" key={department.slug}><div className="directory-card-top"><div><span className="verified-label">DEPARTMENT</span><h2>{department.name}</h2><p className="branch-location">{department.offerings.length} university affiliations</p></div><Link className="text-link" href={`/colleges/${collegeSlug}/${branchSlug}/${department.slug}`}>Explore department <span>↗</span></Link></div></article>)}</div>
        <p className="directory-data-note">This presentation pathway is illustrative. Confirm current details with the institution.</p>
        <Link className="back-link" href={`/colleges/${collegeSlug}`}>← College profile</Link>
      </div>
    </main>
  );
}
