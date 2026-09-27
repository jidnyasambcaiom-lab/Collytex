import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { currentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await currentUser();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="Collytex home">
          <span className="brand-mark">c</span>
          <span>Collytex</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/admissions">Admissions</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link className="header-college-link" href="/register/college">For colleges</Link>
          {user?.role === "PLATFORM_ADMIN" && <Link className="header-login-link" href="/developer">Developer</Link>}
          {user ? (
            <form action="/api/auth/logout" method="post">
              <button className="header-login-link logout-button" type="submit">Log out</button>
            </form>
          ) : (
            <Link className="header-login-link" href="/login">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
