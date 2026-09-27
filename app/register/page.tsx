import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return <main className="auth-page"><Link className="brand auth-brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link><div className="auth-panel"><div className="eyebrow">GET STARTED</div><h1>Create your account.</h1><p>Save colleges and courses as you explore.</p><AuthForm mode="register" accountType="STUDENT" /><div className="auth-switch">Represent a college? <Link href="/register/college">Register your college</Link></div><div className="auth-switch">Already have an account? <Link href="/login">Log in</Link></div></div><footer>Clear information. Better next steps.</footer></main>;
}
