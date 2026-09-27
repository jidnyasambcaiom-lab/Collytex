import Link from "next/link";
import { LoginExperience } from "@/components/login-experience";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  return (
    <main className="presentation-page">
      <SiteHeader />
      <section className="auth-showcase">
        <div className="auth-story">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Good choices<br /><span>start with clarity.</span></h1>
          <p className="auth-story-copy">
            Pick up where you left off. Your shortlist, college insights, and next steps are all in one place.
          </p>
          <div className="auth-proof">
            <span className="proof-orbit" aria-hidden="true">✦</span>
            <div><strong>One platform. Every perspective.</strong><span>Built for students, colleges, and the people connecting them.</span></div>
          </div>
          <Link className="back-home-link" href="/">← Back to home</Link>
        </div>
        <section className="auth-card" aria-label="Sign in">
          <LoginExperience />
          <div className="auth-card-footer">
            New to Collytex? <Link href="/register">Create a student account</Link>
          </div>
          <div className="auth-card-footer">
            Represent a college? <Link href="/register/college">Register your institution</Link>
          </div>
        </section>
      </section>
      <footer className="presentation-footer">Clear information. Better next steps.</footer>
    </main>
  );
}
