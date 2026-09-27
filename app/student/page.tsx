import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
const savedCourseInclude = {
  course: {
    include: {
      offering: {
        include: {
          university: true,
          department: { include: { branch: { include: { college: true } } } },
        },
      },
    },
  },
} satisfies Prisma.StudentSavedCourseInclude;
type SavedCourse = Prisma.StudentSavedCourseGetPayload<{ include: typeof savedCourseInclude }>;

export default async function StudentPage() {
  const user = await requireUser(["STUDENT"]);
  let savedColleges: Array<{ college: { name: string; slug: string } }> = [];
  let savedCourses: SavedCourse[] = [];
  let recentViews: Array<{ title: string; path: string; entityType: string }> = [];
  try {
    savedColleges = await prisma.studentSavedCollege.findMany({ where: { userId: user.id }, include: { college: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" } });
    savedCourses = await prisma.studentSavedCourse.findMany({ where: { userId: user.id }, include: savedCourseInclude, orderBy: { createdAt: "desc" } });
    recentViews = await prisma.recentView.findMany({ where: { userId: user.id }, orderBy: { viewedAt: "desc" }, take: 8, select: { title: true, path: true, entityType: true } });
  } catch { /* An unavailable database is handled by an empty state below. */ }
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/explore">Explore colleges</Link><Link href="/explore?type=courses">Courses</Link></nav><div className="header-actions"><span className="login-link">{user.name}</span><form action="/api/auth/logout" method="post"><button className="login-link logout-button">Log out</button></form></div></header><div className="account-content"><div className="eyebrow">YOUR SHORTLIST</div><h1>A little closer<br />to your next step.</h1><p>Saved colleges and courses stay together here while you explore.</p><div className="account-section-heading"><h2>Colleges</h2><span>{savedColleges.length} saved</span></div>{savedColleges.length >= 2 && <Link className="compare-link" href="/student/compare/colleges">Compare saved colleges →</Link>}{savedColleges.length ? <div className="saved-list">{savedColleges.map(({ college }) => <Link href={`/colleges/${college.slug}`} key={college.slug}>{college.name}<span>Open profile →</span></Link>)}</div> : <div className="empty-state"><span className="empty-mark">i</span><div><strong>Your saved colleges will appear here.</strong><p>Explore the directory to start a shortlist.</p></div><Link href="/explore">Explore colleges →</Link></div>}<div className="account-section-heading"><h2>Courses</h2><span>{savedCourses.length} saved</span></div>{savedCourses.length ? <><div className="saved-list">{savedCourses.map(({ course }) => <Link href={`/colleges/${course.offering.department.branch.college.slug}/${course.offering.department.branch.slug}/${course.offering.department.slug}/${course.offering.university.slug}/${course.slug}`} key={course.slug}>{course.name}<span>{course.offering.university.name} · Open course →</span></Link>)}</div>{savedCourses.length >= 2 && <Link className="compare-link" href="/student/compare">Compare saved courses →</Link>}</> : <div className="empty-state"><span className="empty-mark">i</span><div><strong>No saved courses yet.</strong><p>Find a course that fits and save it for later.</p></div><Link href="/explore?type=courses">Explore courses →</Link></div>}<div className="account-section-heading"><h2>Recently viewed</h2></div>{recentViews.length ? <div className="saved-list">{recentViews.map((item) => <Link href={item.path} key={item.path}>{item.title}<span>{item.entityType} · Reopen →</span></Link>)}</div> : <div className="empty-state"><div><strong>Your recent colleges and courses will appear here.</strong><p>Open a published profile to start your history.</p></div></div>}</div></main>;
}
