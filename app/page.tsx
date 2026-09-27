import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { recordPublicView } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const categoryCards = [
  { title: "Top Colleges", icon: "🎓", accent: "#e6ebff", href: "/explore", description: "Discover verified campuses" },
  { title: "Admissions", icon: "📝", accent: "#f0e7ff", href: "/admissions", description: "Plan your next step" },
  { title: "Course Finder", icon: "🔎", accent: "#e5f7ec", href: "/explore?type=courses", description: "Find a course that fits" },
  { title: "Compare", icon: "↔", accent: "#eaf5ff", href: "/compare", description: "Weigh your options" },
];

const featuredColleges = [
  {
    name: "IIT Bombay",
    location: "Mumbai, Maharashtra",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "IIT Delhi",
    location: "New Delhi",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "BITS Pilani",
    location: "Pilani, Rajasthan",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "BITS Goa",
    location: "Zuarinagar, Goa",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "MET College Adgaon",
    location: "Nashik, Maharashtra",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "IIT Madras",
    location: "Chennai, Tamil Nadu",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1568792923760-d70635a89fdc?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "IISc Bengaluru",
    location: "Bengaluru, Karnataka",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "NIT Tiruchirappalli",
    location: "Tiruchirappalli, Tamil Nadu",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "VJTI Mumbai",
    location: "Mumbai, Maharashtra",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "MIT World Peace University",
    location: "Pune, Maharashtra",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1400&q=85",
  },
] as const;

export default async function Home() {
  const viewer = await currentUser();
  await recordPublicView({ path: "/", userId: viewer?.role === "STUDENT" ? viewer.id : undefined });

  return (
    <main className="page-shell">
      <div className="browser-bar">
        <div className="traffic-lights" aria-hidden="true">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <div className="browser-actions" aria-hidden="true">
          <span className="browser-icon">◁</span>
          <span className="browser-icon">▷</span>
          <span className="browser-icon">↻</span>
        </div>
        <div className="browser-tools" aria-hidden="true">
          <span className="tool">⟲</span>
          <span className="tool">＋</span>
          <span className="tool">▣</span>
        </div>
      </div>

      <section className="hero-wrap">
        <div className="home-hero">
          <div className="home-hero-copy">
            <span className="home-hero-eyebrow"><span aria-hidden="true">✦</span> YOUR NEXT CHAPTER, IN FOCUS</span>
            <h1>Find a place<br />to <span>become.</span></h1>
            <p>Explore colleges, compare courses, and take your next step with more clarity—and a lot less overwhelm.</p>
            <div className="home-hero-actions">
              <Link className="home-primary-link" href="/explore">Explore colleges <span aria-hidden="true">→</span></Link>
              <Link className="home-secondary-link" href="/compare">Compare your options</Link>
            </div>
            <form className="search-box" action="/explore">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input aria-label="Search colleges and courses" name="q" placeholder="Search colleges, courses, or cities" />
              <button type="submit" aria-label="Search">→</button>
            </form>
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <div className="hero-orbit hero-orbit-outer" />
            <div className="hero-orbit hero-orbit-inner" />
            <div className="hero-glow-core"><span>c</span></div>
            <div className="hero-float-card hero-float-card-top"><span className="float-card-icon">✦</span><span><strong>Find your fit</strong><small>Start with what matters</small></span></div>
            <div className="hero-float-card hero-float-card-bottom"><span className="float-check">✓</span><span><strong>Make it yours</strong><small>Your path, your pace</small></span></div>
            <span className="hero-spark hero-spark-one">✦</span>
            <span className="hero-spark hero-spark-two">✧</span>
          </div>
        </div>
      </section>

      <main className="content-shell">
        <section className="section-block featured-section">
          <div className="section-heading-row">
            <div><span className="eyebrow">A FEW PLACES TO BEGIN</span><h2>Featured Colleges</h2></div>
            <div className="featured-heading-actions">
              <Link className="section-view-link" href="/explore">Explore all colleges <span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <div className="college-grid">
            {featuredColleges.map((college) => (
              <Link className="college-card" href="/explore" key={`${college.name}-${college.location}`}>
                <div className="college-image-wrap">
                  <img src={college.image} alt={`${college.name} campus building`} className="college-image" />
                </div>
                <div className="college-card-body">
                  <h3>{college.name}</h3>
                  <div className="college-meta">
                    <span className="location-dot" aria-hidden="true">●</span>
                    {college.location}
                  </div>
                  <div className="rating-row" aria-label={`Rating ${college.rating} out of 5`}>
                    {[...Array(5)].map((_, starIndex) => (
                      <span key={starIndex} className={starIndex < Math.round(college.rating) ? "star active" : "star"}>★</span>
                    ))}
                    <span className="rating-number">{college.rating.toFixed(1)}/5</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-block categories-section">
          <div className="section-heading-row">
            <div><span className="eyebrow">TAKE THE NEXT STEP</span><h2>Explore Collytex</h2></div>
          </div>
          <div className="category-grid">
            {categoryCards.map((card) => (
              <Link className="category-card" key={card.title} href={card.href} style={{ background: card.accent }}>
                <div className="category-icon">{card.icon}</div>
                <div className="category-title">{card.title}</div>
                <div className="category-description">{card.description}</div>
                <span className="category-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-bottom-cta">
          <div><span className="eyebrow">FOR COLLEGES & UNIVERSITIES</span><h2>Help students see what makes you different.</h2></div>
          <Link className="home-primary-link" href="/register/college">Create a college profile <span aria-hidden="true">→</span></Link>
        </section>
      </main>

      <button type="button" className="chat-button neon-button" aria-label="Open chat">💬</button>
    </main>
  );
}
