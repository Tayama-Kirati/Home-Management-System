import { useRef } from "react";
import { P } from '../constants/palette';

const features = [
  { icon:"✅", title:"To-Do & Chores", desc:"Assign tasks and chores to family members, set priorities, and track completion together." },
  { icon:"📅", title:"Family Calendar", desc:"Keep everyone in sync with shared events, birthdays, medical appointments, and reminders." },
  { icon:"💡", title:"Bills & Budget", desc:"Track monthly bills, set budget limits per category, and get alerts before things go overdue." },
  { icon:"🛒", title:"Grocery Tracker", desc:"Log grocery spending by category and month. See where your food budget actually goes." },
  { icon:"⛽", title:"Gas & Utilities", desc:"Monitor gas cylinders, water tank levels, and estimate when you'll need a refill." },
  { icon:"💊", title:"Medicine Tracker", desc:"Track medications for each family member, stock levels, and daily dose reminders." },
  { icon:"🔧", title:"Maintenance", desc:"Schedule recurring home maintenance tasks and get warned when something is overdue." },
  { icon:"🎯", title:"Savings Goals", desc:"Set family savings goals, track contributions, and celebrate when you hit your target." },
  { icon:"👨‍👩‍👧", title:"Family Sharing", desc:"Connect with family members. Everyone sees the same data — no more missed bills or forgotten chores." },
];

export default function LandingPage({ onGo }) {
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: P.white, minHeight: "100vh" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(26,58,92,0.97)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", padding: "0 32px",
        boxShadow: "0 2px 16px rgba(0,0,0,.25)", height: 58,
      }}>
        <div style={{ color: "#7bc8f0", fontWeight: 900, fontSize: 20, fontFamily: "Georgia,serif", marginRight: "auto", cursor: "pointer" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          🏠 KiratiKhim
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavLink onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</NavLink>
          <NavLink onClick={() => scrollTo(featuresRef)}>Features</NavLink>
          <NavLink onClick={() => scrollTo(aboutRef)}>About</NavLink>
          <button onClick={() => onGo("login")} style={{ background: "transparent", color: "#9bbddd", border: "1px solid #2563a8", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginLeft: 8 }}>
            Log In
          </button>
          <button onClick={() => onGo("signup")} style={{ background: "#2563a8", color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg,#0f2744 0%,#1a3a5c 50%,#2563a8 100%)",
        padding: "90px 24px 80px", textAlign: "center", color: "#fff",
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🏠</div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: 42, fontWeight: 700, marginBottom: 18, lineHeight: 1.2 }}>
          Your Family, Organised.
        </h1>
        <p style={{ fontSize: 17, color: "#b8d4f0", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
          KiratiKhim brings every corner of your household under one roof — bills, chores, groceries, medicines, savings, and more. Built for Nepali families.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onGo("signup")} style={{ background: "#fff", color: "#1a3a5c", border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
            Get Started Free
          </button>
          <button onClick={() => scrollTo(featuresRef)} style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,.4)", borderRadius: 10, padding: "14px 36px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            See Features
          </button>
        </div>
        <div style={{ marginTop: 52, display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          {[["15+","Features"],["Free","To Use"],["🇳🇵","Made for Nepal"]].map(([n,l])=>(
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#7bc8f0", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featuresRef} style={{ padding: "72px 24px", background: P.skyBg }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia,serif", color: P.navy, fontSize: 30, textAlign: "center", marginBottom: 8 }}>
            Everything your household needs
          </h2>
          <p style={{ textAlign: "center", color: P.muted, fontSize: 14, marginBottom: 48 }}>
            One app instead of a dozen spreadsheets, reminders, and sticky notes.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: P.white, borderRadius: 14, padding: "22px 20px", border: `1px solid ${P.lightBlue}`, transition: "box-shadow .2s" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, color: P.navy, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: P.muted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section ref={aboutRef} style={{ padding: "72px 24px", background: P.white }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia,serif", color: P.navy, fontSize: 30, marginBottom: 20 }}>
            About KiratiKhim
          </h2>
          <p style={{ fontSize: 14.5, color: P.muted, lineHeight: 1.8, marginBottom: 18 }}>
            KiratiKhim was built for families who want to stay organised without juggling multiple apps. Managing a household means tracking dozens of things at once — when is the electricity bill due? Who hasn't taken their medicine today? Is the gas cylinder about to run out?
          </p>
          <p style={{ fontSize: 14.5, color: P.muted, lineHeight: 1.8, marginBottom: 18 }}>
            With KiratiKhim, every family member can log in and see the same shared data. Parents can assign chores to children, track the monthly budget, and keep medical records in one place. Children can mark tasks done and see upcoming events.
          </p>
          <p style={{ fontSize: 14.5, color: P.muted, lineHeight: 1.8, marginBottom: 36 }}>
            Amounts are shown in <strong style={{ color: P.navy }}>Nepali Rupees (NPR)</strong>, dates follow local conventions, and the app works fully offline in your browser. No subscription needed — just create an account and start managing your home smarter.
          </p>

          <div style={{ background: "linear-gradient(135deg,#1a3a5c,#2563a8)", borderRadius: 16, padding: "32px 28px", color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>Ready to get organised?</div>
            <p style={{ color: "#b8d4f0", fontSize: 13, marginBottom: 22 }}>
              Try the demo accounts — aarav@family.com / priya@family.com / riya@family.com — all with password <strong>1234</strong>.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => onGo("signup")} style={{ background: "#fff", color: "#1a3a5c", border: "none", borderRadius: 9, padding: "11px 30px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Create Account
              </button>
              <button onClick={() => onGo("login")} style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,.4)", borderRadius: 9, padding: "11px 30px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Log In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: P.navy, padding: "24px 32px", textAlign: "center" }}>
        <div style={{ color: "#7bc8f0", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>🏠 KiratiKhim</div>
        <div style={{ color: "#6b8aa8", fontSize: 12 }}>Your family home, managed together.</div>
      </footer>

    </div>
  );
}

function NavLink({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", color: "#9bbddd", border: "none", padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", borderRadius: 6 }}
      onMouseEnter={e => e.target.style.color = "#fff"}
      onMouseLeave={e => e.target.style.color = "#9bbddd"}>
      {children}
    </button>
  );
}
