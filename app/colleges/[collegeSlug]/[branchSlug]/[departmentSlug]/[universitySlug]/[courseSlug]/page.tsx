import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/block-renderer";
import { DataChart } from "@/components/data-chart";
import { DatabaseUnavailable } from "@/components/database-state";
import { SaveToggle } from "@/components/save-toggle";
import { currentUser } from "@/lib/auth";
import { recordPublicView } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import {
  findPresentationBranch,
  findPresentationCollege,
  findPresentationCourse,
  findPresentationDepartment,
  findPresentationOffering,
} from "@/lib/presentation-colleges";

export const dynamic = "force-dynamic";

const courseInclude = {
  offering: { include: { university: true, department: { include: { branch: { include: { college: true } } } } } },
  sections: { where: { status: "PUBLISHED" as const }, orderBy: { position: "asc" as const }, include: { blocks: { orderBy: { position: "asc" as const } } } },
  fees: { orderBy: { academicYear: "desc" as const }, take: 10 },
  cutoffs: { orderBy: { academicYear: "desc" as const }, take: 10 },
  placements: { orderBy: { academicYear: "desc" as const }, take: 10 },
};

function rupees(paise: bigint) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(paise) / 100);
}

function CourseTabs() {
  return (
    <nav className="course-sticky-nav" aria-label="Course information sections">
      <a href="#admission">Admission</a>
      <a href="#fees">Fees</a>
      <a href="#scholarship">Scholarship</a>
      <a href="#syllabus">Syllabus</a>
      <a href="#placement">Placement</a>
      <a href="#custom-sections">Custom Sections</a>
    </nav>
  );
}

export default async function CoursePage({ params }: { params: Promise<{ collegeSlug: string; branchSlug: string; departmentSlug: string; universitySlug: string; courseSlug: string }> }) {
  const { collegeSlug, branchSlug, departmentSlug, universitySlug, courseSlug } = await params;
  let courseRecord = null;
  let databaseUnavailable = false;

  try {
    courseRecord = await prisma.course.findFirst({
      where: {
        slug: courseSlug,
        offering: {
          university: { slug: universitySlug },
          department: { slug: departmentSlug, branch: { slug: branchSlug, isApproved: true, college: { slug: collegeSlug, verificationStatus: "VERIFIED" } } },
        },
      },
      include: courseInclude,
    });
  } catch {
    databaseUnavailable = true;
  }

  if (courseRecord) {
    const viewer = await currentUser();
    const coursePath = `/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}/${courseSlug}`;
    await recordPublicView({ path: coursePath, collegeId: courseRecord.offering.department.branch.collegeId, courseId: courseRecord.id, userId: viewer?.role === "STUDENT" ? viewer.id : undefined, title: courseRecord.name, entityType: "Course" });
    const saved = viewer?.role === "STUDENT"
      ? await prisma.studentSavedCourse.findUnique({ where: { userId_courseId: { userId: viewer.id, courseId: courseRecord.id } }, select: { courseId: true } }).catch(() => null)
      : null;
    const sections = courseRecord.sections;
    const sectionMatches = (sectionTitle: string, keyword: string) => sectionTitle.toLocaleLowerCase().includes(keyword);
    const admissionSections = sections.filter(({ title }) => sectionMatches(title, "admission"));
    const scholarshipSections = sections.filter(({ title }) => sectionMatches(title, "scholarship"));
    const syllabusSections = sections.filter(({ title }) => sectionMatches(title, "syllabus"));
    const customSections = sections.filter(({ title }) => !["admission", "scholarship", "syllabus", "placement", "fee", "cutoff"].some((keyword) => sectionMatches(title, keyword)));
    const renderSections = (items: typeof sections) => items.length ? items.map((section) => (
      <article className="course-section" key={section.id}>
        <h3>{section.title}</h3>
        {section.blocks.map((block) => <BlockRenderer key={block.id} type={block.type} content={block.content} />)}
        {!section.blocks.length && <p className="branch-location">Information not published yet.</p>}
      </article>
    )) : <p className="course-empty-note">Information has not been published yet.</p>;
    const hasPackages = courseRecord.placements.some((item) => item.averagePackagePaise !== null || item.highestPackagePaise !== null);
    const hasPlacementRates = courseRecord.placements.some((item) => item.placementPercentage !== null);

    return (
      <main className="directory-page course-page">
        <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
        <div className="profile-content">
          <div className="breadcrumb-trail">
            <Link href="/explore">Explore</Link><span>/</span>
            <Link href={`/colleges/${collegeSlug}`}>{courseRecord.offering.department.branch.college.name}</Link><span>/</span>
            <Link href={`/colleges/${collegeSlug}/${branchSlug}`}>{courseRecord.offering.department.branch.name}</Link><span>/</span>
            <Link href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}`}>{courseRecord.offering.department.name}</Link><span>/</span>
            <Link href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}`}>{courseRecord.offering.university.name}</Link><span>/</span>
            <span>{courseRecord.name}</span>
          </div>
          <div className="eyebrow">COURSE INFORMATION</div>
          <h1>{courseRecord.name}</h1>
          <p className="profile-description">{courseRecord.offering.department.name} · {courseRecord.offering.university.name}{courseRecord.durationYears ? ` · ${courseRecord.durationYears} years` : ""}</p>
          <div className="profile-action-row"><SaveToggle entity="courses" id={courseRecord.id} initialSaved={!!saved} /></div>
          <CourseTabs />
          <section className="course-data-section" id="admission"><div className="account-section-heading"><h2>Admission</h2><span>Eligibility and application</span></div>{renderSections(admissionSections)}{courseRecord.cutoffs.length > 0 && <div className="course-table-wrap"><h3>Recent cutoffs</h3><table className="course-table"><thead><tr><th>Academic year / category</th><th>Score</th></tr></thead><tbody>{courseRecord.cutoffs.map((cutoff) => <tr key={cutoff.id}><td>{cutoff.academicYear}{cutoff.category ? ` · ${cutoff.category}` : ""}</td><td>{cutoff.score}{cutoff.unit ? ` ${cutoff.unit}` : ""}</td></tr>)}</tbody></table></div>}</section>
          <section className="course-data-section" id="fees"><div className="account-section-heading"><h2>Fees</h2><span>By academic year</span></div>{courseRecord.fees.length ? <div className="course-table-wrap"><table className="course-table"><thead><tr><th>Academic year</th><th>Tuition fees</th><th>Notes</th></tr></thead><tbody>{courseRecord.fees.map((fee) => <tr key={fee.id}><td>{fee.academicYear}</td><td>{rupees(fee.amountPaise)}</td><td>{fee.notes ?? "—"}</td></tr>)}</tbody></table></div> : <p className="course-empty-note">Fee details have not been published yet.</p>}</section>
          <section className="course-data-section" id="scholarship"><div className="account-section-heading"><h2>Scholarship</h2><span>Financial support</span></div>{renderSections(scholarshipSections)}</section>
          <section className="course-data-section" id="syllabus"><div className="account-section-heading"><h2>Syllabus</h2><span>Curriculum and study plan</span></div>{renderSections(syllabusSections)}</section>
          <section className="course-data-section" id="placement"><div className="account-section-heading"><h2>Placement</h2><span>Published outcomes</span></div>
            {courseRecord.placements.length ? <>
              <div className="course-table-wrap"><table className="course-table"><thead><tr><th>Academic year</th><th>Average package</th><th>Highest package</th><th>Placement rate</th><th>Students placed</th></tr></thead><tbody>{courseRecord.placements.map((item) => <tr key={item.id}><td>{item.academicYear}</td><td>{item.averagePackagePaise === null ? "—" : rupees(item.averagePackagePaise)}</td><td>{item.highestPackagePaise === null ? "—" : rupees(item.highestPackagePaise)}</td><td>{item.placementPercentage === null ? "—" : `${item.placementPercentage}%`}</td><td>{item.studentsPlaced ?? "—"}</td></tr>)}</tbody></table></div>
              {hasPackages && <div className="placement-chart"><h3>Package history</h3><DataChart kind="line" ariaLabel="Average and highest placement package by academic year" labels={courseRecord.placements.map((item) => item.academicYear)} datasets={[{ label: "Average package (₹)", data: courseRecord.placements.map((item) => item.averagePackagePaise === null ? null : Number(item.averagePackagePaise) / 100) }, { label: "Highest package (₹)", data: courseRecord.placements.map((item) => item.highestPackagePaise === null ? null : Number(item.highestPackagePaise) / 100) }]} /></div>}
              {hasPlacementRates && <div className="placement-chart"><h3>Placement rate</h3><DataChart ariaLabel="Placement percentage by academic year" labels={courseRecord.placements.map((item) => item.academicYear)} datasets={[{ label: "Placement (%)", data: courseRecord.placements.map((item) => item.placementPercentage) }]} /></div>}
            </> : <p className="course-empty-note">Placement information has not been published yet.</p>}
          </section>
          <section className="course-data-section" id="custom-sections"><div className="account-section-heading"><h2>Custom Sections</h2><span>More course information</span></div>{renderSections(customSections)}</section>
          <Link className="back-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}`}>← {courseRecord.offering.department.name}</Link>
        </div>
      </main>
    );
  }

  if (databaseUnavailable) {
    const presentationCourse = findPresentationCourse(collegeSlug, branchSlug, departmentSlug, universitySlug, courseSlug);
    if (!presentationCourse) return <DatabaseUnavailable />;
  }
  const presentationCourse = findPresentationCourse(collegeSlug, branchSlug, departmentSlug, universitySlug, courseSlug);
  if (!presentationCourse) notFound();

  const presentationCollege = findPresentationCollege(collegeSlug);
  const presentationBranch = findPresentationBranch(collegeSlug, branchSlug);
  const presentationDepartment = findPresentationDepartment(collegeSlug, branchSlug, departmentSlug);
  const presentationOffering = findPresentationOffering(collegeSlug, branchSlug, departmentSlug, universitySlug);
  if (!presentationCollege || !presentationBranch || !presentationDepartment || !presentationOffering) notFound();

  const renderPresentationSection = (keyword: string) => {
    const sections = presentationCourse.sections.filter(({ title }) => title.toLocaleLowerCase().includes(keyword));
    return sections.map((section) => <article className="course-section" key={section.title}><h3>{section.title}</h3><p>{section.content}</p></article>);
  };

  return (
    <main className="directory-page course-page">
      <header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link></nav><div className="header-actions"><Link className="login-link" href="/login">Log in</Link></div></header>
      <div className="profile-content">
        <div className="breadcrumb-trail">
          <Link href="/explore">Explore</Link><span>/</span>
          <Link href={`/colleges/${collegeSlug}`}>{presentationCollege.name}</Link><span>/</span>
          <Link href={`/colleges/${collegeSlug}/${branchSlug}`}>{presentationBranch.name}</Link><span>/</span>
          <Link href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}`}>{presentationDepartment.name}</Link><span>/</span>
          <Link href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}`}>{presentationOffering.university.name}</Link><span>/</span>
          <span>{presentationCourse.name}</span>
        </div>
        <div className="eyebrow">COURSE INFORMATION</div>
        <h1>{presentationCourse.name}</h1>
        <p className="profile-description">{presentationDepartment.name} · {presentationOffering.university.name} · {presentationCourse.durationYears} years</p>
        <CourseTabs />
        <p className="directory-data-note">Illustrative presentation content only. Confirm current admissions, fees, scholarships, and placement data with the institution.</p>
        <section className="course-data-section" id="admission"><div className="account-section-heading"><h2>Admission</h2><span>Eligibility and application</span></div>{renderPresentationSection("admission")}</section>
        <section className="course-data-section" id="fees"><div className="account-section-heading"><h2>Fees</h2><span>By academic year</span></div><div className="course-table-wrap"><table className="course-table"><thead><tr><th>Academic year</th><th>Tuition fees</th></tr></thead><tbody>{presentationCourse.fees.map((fee) => <tr key={fee.year}><td>{fee.year}</td><td>₹{fee.amount.toLocaleString("en-IN")}</td></tr>)}</tbody></table></div></section>
        <section className="course-data-section" id="scholarship"><div className="account-section-heading"><h2>Scholarship</h2><span>Financial support</span></div>{renderPresentationSection("scholarship")}</section>
        <section className="course-data-section" id="syllabus"><div className="account-section-heading"><h2>Syllabus</h2><span>Curriculum and study plan</span></div>{renderPresentationSection("syllabus")}</section>
        <section className="course-data-section" id="placement"><div className="account-section-heading"><h2>Placement</h2><span>Illustrative outcomes</span></div><div className="course-table-wrap"><table className="course-table"><thead><tr><th>Academic year</th><th>Average package</th><th>Highest package</th><th>Placement rate</th></tr></thead><tbody>{presentationCourse.placements.map((item) => <tr key={item.year}><td>{item.year}</td><td>{item.average}</td><td>{item.highest}</td><td>{item.placementRate}</td></tr>)}</tbody></table></div></section>
        <section className="course-data-section" id="custom-sections"><div className="account-section-heading"><h2>Custom Sections</h2><span>More course information</span></div>{presentationCourse.sections.filter(({ title }) => !["admission", "scholarship", "syllabus", "placement", "fee", "cutoff"].some((keyword) => title.toLocaleLowerCase().includes(keyword))).map((section) => <article className="course-section" key={section.title}><h3>{section.title}</h3><p>{section.content}</p></article>)}</section>
        <Link className="back-link" href={`/colleges/${collegeSlug}/${branchSlug}/${departmentSlug}/${universitySlug}`}>← {presentationOffering.university.name}</Link>
      </div>
    </main>
  );
}
