import Link from "next/link";

const steps = [
  { number: "01", title: "Explore your options", detail: "Discover verified colleges, campuses, and courses that match your interests." },
  { number: "02", title: "Compare what matters", detail: "Review published details side by side and build a confident shortlist." },
  { number: "03", title: "Connect with colleges", detail: "Use official college information to plan your next conversation and application." },
];

const checklist = ["Your academic details and latest results", "A shortlist of programs and colleges", "Questions about fees, deadlines, and campus life"];

export default function AdmissionsPage() {
  return (
    <main className="presentation-page">
      <section className="marketing-hero admissions-hero">
        <div className="admissions-copy">
          <span className="eyebrow">YOUR FUTURE, IN FOCUS</span>
          <h1>From “what if?”<br />to <span>what’s next.</span></h1>
          <p>Admissions feel simpler when you know what to look for. Start with the colleges and courses that fit your goals.</p>
          <div className="hero-actions">
            <Link className="button neon-button" href="/explore">Explore colleges <span aria-hidden="true">→</span></Link>
            <Link className="button button-secondary" href="/compare">Compare options</Link>
          </div>
        </div>
        <aside className="admissions-note">
          <span className="note-spark" aria-hidden="true">✦</span>
          <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
          <h2>Your next-step checklist</h2>
          <ul>{checklist.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
          <p>Deadlines and requirements vary by institution. Confirm current details with each college.</p>
        </aside>
      </section>
      <section className="marketing-features admissions-steps">
        <div className="marketing-section-heading"><span className="eyebrow">A SIMPLE START</span><h2>Make the process your own.</h2></div>
        <div className="feature-grid">{steps.map((step) => <article className="feature-card step-card" key={step.number}><span className="feature-number">{step.number}</span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div>
        <div className="admissions-cta"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Your next step starts with a search.</h2></div><Link className="button neon-button" href="/explore">Find your fit <span aria-hidden="true">→</span></Link></div>
      </section>
      <footer className="marketing-footer"><Link href="/register/college">Represent a college? Join Collytex →</Link><span>Clear information. Better next steps.</span><Link href="/login">Sign in</Link></footer>
    </main>
  );
}
