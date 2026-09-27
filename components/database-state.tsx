import Link from "next/link";

export function DatabaseUnavailable() {
  return <main className="directory-page"><header className="site-header"><Link className="brand" href="/"><span className="brand-mark">c</span><span>collytex</span></Link></header><div className="directory-content"><div className="eyebrow">COLLYTEX DIRECTORY</div><h1>We’re getting things ready.</h1><p className="directory-intro">College information is temporarily unavailable. Please try again later.</p><Link className="back-link" href="/">Return home</Link></div></main>;
}
