import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-state";
import { findPresentationBranch, findPresentationCollege, findPresentationDepartment } from "@/lib/presentation-colleges";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DepartmentPage({ params }: { params: Promise<{ collegeSlug: string; branchSlug: string; departmentSlug: string }> }) {
  const { collegeSlug, branchSlug, departmentSlug } = await params;
  const presentationDepartment = findPresentationDepartment(collegeSlug, branchSlug, departmentSlug);
  let department = null;
  let databaseUnavailable = false;

  try {
    department = await prisma.department.findFirst({
      where: { slug: departmentSlug, branch: { slug: branchSlug, isApproved: true, college: { slug: collegeSlug, verificationStatus: "VERIFIED" } } },
      include: {
        branch: { include: { college: true } },
        offerings: { include: { university: true, courses: { orderBy: { name: "asc" } } } },
      },
    });
  } catch {
    databaseUnavailable = true;
  }

  if (databaseUnavailable && !presentationDepartment) return <DatabaseUnavailable />;
  if (department) {
    if (department.offerings.length === 1) redirect(`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${department.offerings[0].university.slug}`);
    return (
      <main className="directory-page">
        <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
        <div className="profile-content">
          <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><Link href={`/colleges/${collegeSlug}`}>{department.branch.college.name}</Link><span>/</span><Link href={`/colleges/${collegeSlug}/${branchSlug}`}>{department.branch.name}</Link><span>/</span><span>{department.name}</span></div>
          <div className="eyebrow">DEPARTMENT</div><h1>{department.name}</h1>
          <p className="profile-description">Select an affiliated university to view only its courses offered by this department.</p>
          <div className="account-section-heading"><h2>Affiliated universities</h2><span>{department.offerings.length}</span></div>
          <div className="directory-list">{department.offerings.map((offering) => <article className="directory-card" key={offering.id}><div className="directory-card-top"><div><span className="verified-label">UNIVERSITY</span><h2>{offering.university.name}</h2><p className="branch-location">{offering.courses.length} courses offered through this department</p></div><Link className="text-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${offering.university.slug}`}>View courses <span>↗</span></Link></div><div className="directory-meta">{offering.courses.map((course) => <span key={course.id}>{course.name}</span>)}</div></article>)}</div>
          <Link className="back-link" href={`/colleges/${collegeSlug}/${branchSlug}`}>← {department.branch.name}</Link>
        </div>
      </main>
    );
  }

  if (!presentationDepartment) notFound();
  if (presentationDepartment.offerings.length === 1) {
    redirect(`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${presentationDepartment.offerings[0].university.slug}`);
  }

  const branch = findPresentationBranch(collegeSlug, branchSlug);
  const college = findPresentationCollege(collegeSlug);
  return (
    <main className="directory-page">
      <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
      <div className="profile-content">
        <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><Link href={`/colleges/${collegeSlug}`}>{college?.name ?? collegeSlug}</Link><span>/</span><Link href={`/colleges/${collegeSlug}/${branchSlug}`}>{branch?.name ?? branchSlug}</Link><span>/</span><span>{presentationDepartment.name}</span></div>
        <div className="eyebrow">DEPARTMENT</div><h1>{presentationDepartment.name}</h1>
        <p className="profile-description">Select an affiliated university to view only its courses offered by this department.</p>
        <div className="account-section-heading"><h2>Affiliated universities</h2><span>{presentationDepartment.offerings.length}</span></div>
        <div className="directory-list">{presentationDepartment.offerings.map((offering) => <article className="directory-card" key={offering.university.slug}><div className="directory-card-top"><div><span className="verified-label">UNIVERSITY</span><h2>{offering.university.name}</h2><p className="branch-location">{offering.courses.length} courses offered through this department</p></div><Link className="text-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${offering.university.slug}`}>View courses <span>↗</span></Link></div><div className="directory-meta">{offering.courses.map((course) => <span key={course.slug}>{course.name}</span>)}</div></article>)}</div>
        <p className="directory-data-note">University and course relationships shown here are stored per department; courses from other departments are not included.</p>
        <Link className="back-link" href={`/colleges/${collegeSlug}/${branchSlug}`}>← {branch?.name ?? "Campus"}</Link>
      </div>
    </main>
  );
}
