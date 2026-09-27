import Link from "next/link";
import { requireUser } from "@/lib/permissions";
import { ManagementForm } from "@/components/management-form";

export default async function NewBranchPage() {
  await requireUser(["COLLEGE_HEAD"]);
  return <main className="account-page"><header className="site-header"><Link className="brand" href="/college"><span className="brand-mark">c</span><span>collytex</span></Link><nav className="main-nav"><Link href="/college">Dashboard</Link><Link href="/college/branches">Branches</Link></nav></header><div className="account-content narrow-content"><div className="eyebrow">ORGANIZATION SETUP</div><h1>Add a campus.</h1><p>New campuses need your approval before their information appears publicly.</p><div className="management-card"><ManagementForm endpoint="/api/college/branches" submitText="Create campus" fields={[{ name: "name", label: "Campus name", maxLength: 120 }, { name: "city", label: "City", maxLength: 100 }, { name: "state", label: "State", maxLength: 100 }, { name: "address", label: "Address (optional)", required: false, maxLength: 500 }]} /></div><Link className="back-link" href="/college">← Back to dashboard</Link></div></main>;
}
