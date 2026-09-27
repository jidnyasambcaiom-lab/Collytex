import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-state";
import { PresentationCollegeActions } from "@/components/presentation-college-actions";
import { SaveToggle } from "@/components/save-toggle";
import { currentUser } from "@/lib/auth";
import { recordPublicView } from "@/lib/analytics";
import {
  countBranchCourses,
  countCollegeCourses,
  countCollegeDepartments,
  findPresentationCollege,
} from "@/lib/presentation-colleges";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CollegePage({ params }: { params: Promise<{ collegeSlug: string }> }) {
  const { collegeSlug } = await params;
  const presentationCollege = findPresentationCollege(collegeSlug);
  let college = null;
  let databaseUnavailable = false;

  try {
    college = await prisma.college.findFirst({
      where: { slug: collegeSlug, verificationStatus: "VERIFIED" },
      include: {
        branches: {
          where: { isApproved: true },
          orderBy: { name: "asc" },
          include: { departments: { include: { offerings: { include: { courses: true } } } } },
        },
      },
    });
  } catch {
    databaseUnavailable = true;
  }

  if (databaseUnavailable && !presentationCollege) return <DatabaseUnavailable />;
  if (college) {
    if (college.branches.length === 1) redirect(`/colleges/${collegeSlug}/${college.branches[0].slug}`);
    const viewer = await currentUser();
    await recordPublicView({ path: `/colleges/${college.slug}`, collegeId: college.id, userId: viewer?.role === "STUDENT" ? viewer.id : undefined, title: college.name, entityType: "College" });
    const saved = viewer?.role === "STUDENT"
      ? await prisma.studentSavedCollege.findUnique({ where: { userId_collegeId: { userId: viewer.id, collegeId: college.id } }, select: { collegeId: true } }).catch(() => null)
      : null;
    const departmentCount = college.branches.reduce((count, branch) => count + branch.departments.length, 0);
    const courseCount = college.branches.reduce((count, branch) => count + branch.departments.reduce((sum, department) => sum + department.offerings.reduce((total, offering) => total + offering.courses.length, 0), 0), 0);

    return (
      <main className="directory-page">
        <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
        <div className="profile-content">
          <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><span>{college.name}</span></div>
          <div className="eyebrow">✓ VERIFIED COLLEGE</div>
          <h1>{college.name}</h1>
          <p className="profile-description">{college.description ?? "Explore the campuses, departments, and university affiliations published by this college."}</p>
          <div className="profile-detail-row"><span>{college.branches.length} campuses · {departmentCount} departments · {courseCount} courses</span>{college.website && <a href={college.website} target="_blank" rel="noreferrer">Official website ↗</a>}</div>
          <div className="profile-action-row"><SaveToggle entity="colleges" id={college.id} initialSaved={!!saved} /><Link className="button button-light button-small" href="/student/compare/colleges">Compare colleges</Link></div>
          <div className="account-section-heading"><h2>Branches / Campuses</h2><span>{college.branches.length}</span></div>
          <div className="directory-list">{college.branches.map((branch) => {
            const courseCount = branch.departments.reduce((sum, department) => sum + department.offerings.reduce((total, offering) => total + offering.courses.length, 0), 0);
            return <article className="directory-card" key={branch.id}><div className="directory-card-top"><div><span className="verified-label">CAMPUS</span><h2>{branch.name}</h2><p className="branch-location">{branch.city}, {branch.state}</p></div><Link className="text-link" href={`/colleges/${college.slug}/${branch.slug}`}>Explore campus <span>↗</span></Link></div><p className="branch-counts">{branch.departments.length} departments · {courseCount} courses</p></article>;
          })}</div>
          <Link className="back-link" href="/explore">← Back to colleges</Link>
        </div>
      </main>
    );
  }

  if (!presentationCollege) notFound();
  if (presentationCollege.branches.length === 1) redirect(`/colleges/${collegeSlug}/${presentationCollege.branches[0].slug}`);

  return (
    <main className="directory-page">
      <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
      <div className="profile-content">
        <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><span>{presentationCollege.name}</span></div>
        <div className="eyebrow">COLLEGE PROFILE</div>
        <h1>{presentationCollege.name}</h1>
        <p className="profile-description">{presentationCollege.description}</p>
        <div className="profile-detail-row"><span>{presentationCollege.branches.length} campuses · {countCollegeDepartments(presentationCollege)} departments · {countCollegeCourses(presentationCollege)} courses</span><a href={presentationCollege.website} target="_blank" rel="noreferrer">Official website ↗</a></div>
        <PresentationCollegeActions />
        <div className="account-section-heading"><h2>Branches / Campuses</h2><span>{presentationCollege.branches.length}</span></div>
        <div className="directory-list">{presentationCollege.branches.map((branch) => <article className="directory-card" key={branch.slug}><div className="directory-card-top"><div><span className="verified-label">CAMPUS</span><h2>{branch.name}</h2><p className="branch-location">{branch.city}, {branch.state}</p></div><Link className="text-link" href={`/colleges/${collegeSlug}/${branch.slug}`}>Explore campus <span>↗</span></Link></div><p className="branch-counts">{branch.departments.length} departments · {countBranchCourses(branch)} courses</p></article>)}</div>
        <p className="directory-data-note">This presentation profile contains illustrative pathway data. Confirm current details with the institution.</p>
        <Link className="back-link" href="/explore">← Back to colleges</Link>
      </div>
    </main>
  );
}
