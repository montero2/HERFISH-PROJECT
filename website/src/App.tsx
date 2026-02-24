import logo from './assets/logo_symbol.png'

const websiteHost = `${window.location.protocol}//${window.location.hostname}`
const customerWebApp = `${websiteHost}:5174`
const androidApkUrl = import.meta.env.VITE_ANDROID_APK_URL || `${customerWebApp}?install=android`
const windowsInstallerUrl = import.meta.env.VITE_WINDOWS_INSTALLER_URL || `${customerWebApp}?install=windows`
const macInstallerUrl = import.meta.env.VITE_MAC_INSTALLER_URL || `${customerWebApp}?install=mac`
const releaseNotesUrl = import.meta.env.VITE_RELEASE_NOTES_URL || 'https://github.com/montero2/HERFISH-PROJECT/releases'

function App() {
  return (
    <div className="site">
      <header className="topbar">
        <div className="brand">
          <img src={logo} alt="HERFISH LEGACY logo" className="logo" />
          <div>
            <p className="brand-name">HERFISH LEGACY</p>
            <p className="brand-tag">Female Owned. Female Led. Rural Kenya Focused.</p>
          </div>
        </div>
        <nav className="nav">
          <a href="#mission">Mission</a>
          <a href="#impact">Impact</a>
          <a href="#download">Download App</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Official Company Website</p>
            <h1>Digital fish commerce built by women, for women and entrepreneurs in rural Kenya.</h1>
            <p>
              HERFISH LEGACY equips fish traders, buyers, and distributors with a connected platform:
              customer ordering, digital payments, and ERP-based fulfillment in one workflow.
            </p>
            <div className="cta-row">
              <a className="btn primary" href="#download">Download Customer App</a>
              <a className="btn ghost" href={customerWebApp} target="_blank" rel="noreferrer">Open Web App Now</a>
            </div>
          </div>
          <aside className="hero-card">
            <h3>What the platform solves</h3>
            <ul>
              <li>Faster order capture from customers using phone or desktop.</li>
              <li>Instant payment and order visibility in HERFISH ERP.</li>
              <li>Better market access for women-led fish businesses in rural areas.</li>
            </ul>
          </aside>
        </section>

        <section id="mission" className="panel">
          <h2>Our Mission</h2>
          <p>
            HERFISH LEGACY is a female-owned, female-led movement building digital power for women in the rural fish
            economy. We are closing the technology gap between small fishing communities and modern commerce by giving
            traders, processors, and buyers one reliable platform for ordering, payment, and fulfillment.
          </p>
          <p>
            In many rural markets, women run the backbone of fish distribution but remain underserved by digital tools.
            HERFISH LEGACY changes that reality with practical, mobile-first systems that make business faster, safer,
            and more visible from beach landing sites to inland retail points.
          </p>
        </section>

        <section id="impact" className="panel split">
          <article>
            <h3>Women-Centered Business Model</h3>
            <p>
              We design for real field conditions: unstable connectivity, cash-flow pressure, and fragmented supply.
              Women-led fish businesses can onboard quickly, digitize records, and transact with confidence.
            </p>
          </article>
          <article>
            <h3>Sustainable Digital Growth</h3>
            <p>
              Every confirmed order and payment syncs into ERP in real time. This cuts delays, reduces spoilage,
              strengthens inventory planning, and gives teams cleaner financial visibility for growth.
            </p>
          </article>
          <article>
            <h3>Rural Kenya Coverage</h3>
            <p>
              From remote fish hubs to urban buyers, HERFISH LEGACY connects communities that were previously excluded
              from efficient digital trade. The result is broader market reach and stronger income resilience.
            </p>
          </article>
        </section>

        <section className="panel story">
          <h2>Digital Inclusivity in Action</h2>
          <p>
            This is not just software. It is infrastructure for dignity, access, and economic participation. By turning
            manual trade into connected digital workflows, HERFISH LEGACY helps women entrepreneurs negotiate better,
            sell faster, track every transaction, and compete in a market that increasingly rewards speed and trust.
          </p>
          <p>
            When customers install the HERFISH app, they are not only placing orders. They are directly supporting an
            inclusive supply chain where rural women-led businesses can thrive with data, payments, and visibility.
          </p>
        </section>

        <section id="download" className="panel">
          <h2>Download and Install the Customer App</h2>
          <p className="muted">
            Install from browser (PWA) today for Android and desktop, and publish native package links here when releases are ready.
          </p>
          <div className="download-grid">
            <div className="download-card">
              <h3>Android Phone</h3>
              <p>Open app and tap Install App, or use browser menu Add to Home Screen.</p>
              <a className="btn primary" href={androidApkUrl} target="_blank" rel="noreferrer">Install for Android</a>
            </div>
            <div className="download-card">
              <h3>Windows Desktop</h3>
              <p>Open app in Edge/Chrome and click Install App for desktop shortcut mode.</p>
              <a className="btn primary" href={windowsInstallerUrl} target="_blank" rel="noreferrer">Install for Windows</a>
            </div>
            <div className="download-card">
              <h3>Mac Desktop</h3>
              <p>Open app in Chrome and install as desktop app from browser toolbar.</p>
              <a className="btn primary" href={macInstallerUrl} target="_blank" rel="noreferrer">Install for Mac</a>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 12 }}>
            For native APK/EXE/DMG package releases, publish release files and map links using website env vars.
            <a href={releaseNotesUrl} target="_blank" rel="noreferrer"> View release channel.</a>
          </p>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-brand">MADE BY MOSESTA LIMITED</p>
        <p className="footer-rights">{'\u00A9'} All rights reserved</p>
      </footer>
    </div>
  )
}

export default App
