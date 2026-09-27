import Link from "next/link";

const comparisonPoints = [
  { icon: "⌖", title: "Campus life", detail: "Compare locations, approved campuses, and the communities around them." },
  { icon: "◈", title: "Courses & costs", detail: "Bring course details and the latest published fees into view." },
  { icon: "↗", title: "Student outcomes", detail: "Review placement information and published career outcomes side by side." },
];

export default function ComparePage() {
  return (
    <main className="presentation-page">
      <section className="marketing-hero compare-hero">
        <span className="eyebrow">A CLEARER WAY TO CHOOSE</span>
        <h1>Good options.<br /><span>Side by side.</span></h1>
        <p>Compare the details that matter—from campus and courses to fees and outcomes—and make your shortlist with confidence.</p>
        <div className="hero-actions">
          <Link className="button neon-button" href="/student/compare/colleges">Compare colleges <span aria-hidden="true">→</span></Link>
          <Link className="button button-secondary" href="/student/compare">Compare courses</Link>
        </div>
        <div className="compare-preview" aria-label="Comparison preview">
          <div className="preview-label"><span className="live-dot" /> YOUR COMPARISON, SIMPLIFIED</div>
          <div className="preview-columns">
            <div className="preview-heading">What matters</div>
            <div><span className="preview-monogram">A</span><strong>Northstar</strong><small>University</small></div>
            <div><span className="preview-monogram preview-monogram-violet">S</span><strong>Summit</strong><small>Institute</small></div>
          </div>
          <div className="preview-row"><span>Published courses</span><strong>24 courses</strong><strong>18 courses</strong></div>
          <div className="preview-row"><span>Approved campuses</span><strong>3 campuses</strong><strong>2 campuses</strong></div>
          <div className="preview-row"><span>Verified profile</span><strong className="preview-verified">✓ Verified</strong><strong className="preview-verified">✓ Verified</strong></div>
          <p className="preview-footnote">A sample view. College details appear when they’re published.</p>
        </div>
      </section>
      <section className="marketing-features">
        <div className="marketing-section-heading"><span className="eyebrow">COMPARE WITH CONFIDENCE</span><h2>See beyond the brochure.</h2></div>
        <div className="feature-grid">{comparisonPoints.map((point, index) => <article className="feature-card" key={point.title}><span className="feature-number">0{index + 1}</span><span className="feature-icon">{point.icon}</span><h3>{point.title}</h3><p>{point.detail}</p></article>)}</div>
      </section>
      <footer className="marketing-footer"><Link href="/explore">Start exploring colleges →</Link><span>Clear information. Better next steps.</span><Link href="/login">Sign in</Link></footer>
    </main>
  );
}
