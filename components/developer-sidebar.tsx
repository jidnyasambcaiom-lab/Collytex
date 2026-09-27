import Link from "next/link";

const groups = [
  {
    label: "Overview",
    items: [{ label: "Overview", href: "/developer" }],
  },
  {
    label: "Management",
    items: [
      { label: "Users", href: "/developer/users" },
      { label: "Colleges", href: "/developer/colleges" },
      { label: "Content", href: "/developer/content" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Database", href: "/developer/database" },
      { label: "Analytics", href: "/developer/analytics" },
      { label: "Activity", href: "/developer/activity" },
      { label: "Security", href: "/developer/security" },
      { label: "Errors", href: "/developer/errors" },
      { label: "Storage", href: "/developer/storage" },
      { label: "System", href: "/developer/system" },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", href: "/developer/settings" }],
  },
];

export function DeveloperSidebar() {
  return (
    <aside className="developer-sidebar">
      <Link href="/developer" className="developer-brand">
        <span className="developer-brand-mark">C</span>
        <span>COLLYTEX <small>CONTROL PLANE</small></span>
      </Link>
      <div className="developer-sidebar-scroll">
        {groups.map((group) => (
          <section className="developer-nav-group" key={group.label}>
            <h2>{group.label}</h2>
            {group.items.map((item) => (
              <Link className="developer-nav-link" href={item.href} key={item.href}>
                <span className="developer-nav-indicator" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </section>
        ))}
      </div>
      <form className="developer-sidebar-logout" action="/api/auth/logout" method="post">
        <button type="submit">Logout <span aria-hidden="true">↗</span></button>
      </form>
    </aside>
  );
}
