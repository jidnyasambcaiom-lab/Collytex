import Link from "next/link";
import { CollegeRegistration } from "@/components/college-registration";

export default function CollegeRegistrationPage() {
  return (
    <main className="presentation-page">
      <section className="registration-layout">
        <div className="registration-intro">
          <span className="eyebrow">FOR COLLEGES & UNIVERSITIES</span>
          <h1>Make your<br /><span>next step</span> count.</h1>
          <p>Give students a clearer view of your campus, programs, and outcomes—with one trusted profile.</p>
          <div className="registration-benefits">
            <div><span>01</span><p><strong>Tell your full story</strong><small>Bring campuses, courses, and outcomes together.</small></p></div>
            <div><span>02</span><p><strong>Reach the right students</strong><small>Help students discover what makes you different.</small></p></div>
            <div><span>03</span><p><strong>Build trust with clarity</strong><small>Keep important college information in one place.</small></p></div>
          </div>
          <Link className="back-home-link" href="/">← Back to home</Link>
        </div>
        <section className="registration-card">
          <div className="registration-card-heading">
            <span className="eyebrow">START YOUR PROFILE</span>
            <h2>Let’s meet your college.</h2>
            <p>Share a few details to get started with your college profile.</p>
          </div>
          <CollegeRegistration />
          <div className="auth-card-footer">Already have a Collytex account? <Link href="/login">Log in</Link></div>
        </section>
      </section>
      <footer className="presentation-footer">Clear information. Better next steps.</footer>
    </main>
  );
}
