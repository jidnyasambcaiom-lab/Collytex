import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-state";
import { findPresentationOffering, findPresentationDepartment, findPresentationBranch, findPresentationCollege } from "@/lib/presentation-colleges";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UniversityPage({ params }: { params: Promise<{ collegeSlug: string; branchSlug: string; departmentSlug: string; universitySlug: string }> }) {
  const { collegeSlug, branchSlug, departmentSlug, universitySlug } = await params;
  const presentationOffering = findPresentationOffering(collegeSlug, branchSlug, departmentSlug, universitySlug);
  let offering = null;
  let databaseUnavailable = false;

  try {
    offering = await prisma.departmentUniversity.findFirst({
      where: { university: { slug: universitySlug }, department: { slug: departmentSlug, branch: { slug: branchSlug, isApproved: true, college: { slug: collegeSlug, verificationStatus: "VERIFIED" } } } },
      include: {
        university: true,
        department: { include: { branch: { include: { college: true } } } },
        courses: { orderBy: { name: "asc" } },
      },
    });
  } catch {
    databaseUnavailable = true;
  }

  if (databaseUnavailable && !presentationOffering) return <DatabaseUnavailable />;
  if (offering) {
    if (offering.courses.length === 1) redirect(`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}/${offering.courses[0].slug}`);
    return (
      <main className="directory-page">
        <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
        <div className="profile-content">
          <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><Link href={`/colleges/${collegeSlug}`}>{offering.department.branch.college.name}</Link><span>/</span><Link href={`/colleges/${collegeSlug}/${branchSlug}`}>{offering.department.branch.name}</Link><span>/</span><Link href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}`}>{offering.department.name}</Link><span>/</span><span>{offering.university.name}</span></div>
          <div className="eyebrow">AFFILIATED UNIVERSITY</div><h1>{offering.university.name}</h1>
          <p className="profile-description">Courses offered by this university through {offering.department.name} at {offering.department.branch.name}.</p>
          <div className="account-section-heading"><h2>Courses</h2><span>{offering.courses.length}</span></div>
          <div className="directory-list">{offering.courses.map((course) => <article className="directory-card" key={course.id}><div className="directory-card-top"><div><span className="verified-label">{course.level ?? "COURSE"}</span><h2>{course.name}</h2><p className="branch-location">{course.durationYears ? `${course.durationYears} years` : "Course information"}</p></div><Link className="text-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}/${course.slug}`}>View course <span>↗</span></Link></div></article>)}</div>
          <Link className="back-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}`}>← {offering.department.name}</Link>
        </div>
      </main>
    );
  }

  if (!presentationOffering) notFound();
  if (presentationOffering.courses.length === 1) {
    redirect(`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}/${presentationOffering.courses[0].slug}`);
  }
  const presentationDepartment = findPresentationDepartment(collegeSlug, branchSlug, departmentSlug);
  const presentationBranch = findPresentationBranch(collegeSlug, branchSlug);
  const presentationCollege = findPresentationCollege(collegeSlug);
  return (
    <main className="directory-page">
      <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
      <div className="profile-content">
        <div className="breadcrumb-trail"><Link href="/explore">Explore</Link><span>/</span><Link href={`/colleges/${collegeSlug}`}>{presentationCollege?.name ?? collegeSlug}</Link><span>/</span><Link href={`/colleges/${collegeSlug}/${branchSlug}`}>{presentationBranch?.name ?? branchSlug}</Link><span>/</span><Link href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}`}>{presentationDepartment?.name ?? departmentSlug}</Link><span>/</span><span>{presentationOffering.university.name}</span></div>
        <div className="eyebrow">AFFILIATED UNIVERSITY</div><h1>{presentationOffering.university.name}</h1>
        <p className="profile-description">Courses offered by this university through {presentationDepartment?.name ?? "this department"} at {presentationBranch?.name ?? "this campus"}.</p>
        <div className="account-section-heading"><h2>Courses</h2><span>{presentationOffering.courses.length}</span></div>
        <div className="directory-list">{presentationOffering.courses.map((course) => <article className="directory-card" key={course.slug}><div className="directory-card-top"><div><span className="verified-label">{course.level}</span><h2>{course.name}</h2><p className="branch-location">{course.durationYears} years</p></div><Link className="text-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}/${course.slug}`}>View course <span>↗</span></Link></div></article>)}</div>
        <p className="directory-data-note">These courses belong to this specific department–university affiliation.</p>
        <Link className="back-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}`}>← {presentationDepartment?.name ?? "Department"}</Link>
      </div>
    </main>
  );
}
