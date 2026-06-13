import {
  GitBranch, Sparkles, ArrowRight,
  Brain, Layers, BarChart2, Wrench, Lightbulb, MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";

// ── GitHub URL validation ──────────────────────────────────────────────────────
function validateGithubUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return "Please enter a GitHub repository URL.";
  const pattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
  if (!pattern.test(trimmed))
    return "Enter a valid GitHub URL — e.g. https://github.com/owner/repo";
  return null;
}

// ── Intersection observer hook for scroll-reveal ──────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ── Feature Card with grayscale → color hover ─────────────────────────────────
function FeatureCard({
  icon: Icon,
  label,
  desc,
  color,
  bg,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  bg: string;
  delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transitionDelay: inView ? `${delay}ms` : "0ms",
        transform: inView
          ? hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)"
          : "translateY(24px) scale(0.97)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        filter: hovered ? "none" : "saturate(0.2) brightness(0.7)",
      }}
      className={`
        bg-white/[0.03] border rounded-2xl p-5 cursor-default
        ${hovered
          ? "border-white/20 shadow-[0_0_28px_-4px_rgba(34,211,238,0.18)]"
          : "border-white/[0.07]"
        }
      `}
    >
      {/* Icon */}
      <div
        style={{
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          transform: hovered ? "scale(1.18) rotate(-4deg)" : "scale(1) rotate(0deg)",
        }}
        className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}
      >
        <Icon size={17} />
      </div>

      <h3
        style={{ transition: "color 0.25s ease" }}
        className={`text-sm font-semibold mb-1 ${hovered ? "text-zinc-50" : "text-zinc-400"}`}
      >
        {label}
      </h3>
      <p
        style={{ transition: "color 0.25s ease" }}
        className={`text-[12px] leading-relaxed ${hovered ? "text-zinc-400" : "text-zinc-600"}`}
      >
        {desc}
      </p>

      {/* Bottom glow line — only visible on hover */}
      <div
        style={{
          transition: "opacity 0.35s ease, width 0.4s ease",
          opacity: hovered ? 1 : 0,
          width: hovered ? "100%" : "0%",
        }}
        className="mt-4 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/60 to-violet-400/0"
      />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  val,
  label,
  color,
  delay = 0,
}: {
  val: string;
  label: string;
  color: string;
  delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transitionDelay: inView ? `${delay}ms` : "0ms",
        transform: inView
          ? hovered ? "translateY(-5px)" : "translateY(0)"
          : "translateY(20px)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease, border-color 0.25s ease",
        filter: hovered ? "none" : "saturate(0.15) brightness(0.65)",
      }}
      className={`
        bg-white/[0.03] border rounded-2xl p-5 text-center cursor-default
        ${hovered ? "border-white/20" : "border-white/[0.07]"}
      `}
    >
      <div
        style={{ transition: "letter-spacing 0.3s ease" }}
        className={`text-3xl font-extrabold tracking-tight ${color}`}
      >
        {val}
      </div>
      <div
        style={{ transition: "color 0.25s ease" }}
        className={`text-[11px] mt-1 ${hovered ? "text-zinc-400" : "text-zinc-600"}`}
      >
        {label}
      </div>
    </div>
  );
}

// ── Example Chip ──────────────────────────────────────────────────────────────
function ExampleChip({
  repo,
  onClick,
}: {
  repo: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        transform: hovered ? "translateY(-2px) scale(1.04)" : "translateY(0) scale(1)",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, color 0.2s ease",
      }}
      className={`
        border bg-white/[0.03] rounded-full px-3 py-1 text-[11px] font-mono
        ${hovered
          ? "border-cyan-400/40 text-cyan-400"
          : "border-white/[0.07] text-zinc-500"
        }
      `}
    >
      {repo.split("/").slice(-2).join("/")}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function Home() {
  const [repoUrl, setRepoUrl]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const loadingToastId          = useRef<number | null>(null);
  const navigate                = useNavigate();
  const { toasts, success, error, loading: toastLoading, removeToast } = useToast();

  const examples = [
    "https://github.com/facebook/react",
    "https://github.com/vercel/next.js",
    "https://github.com/microsoft/vscode",
    "https://github.com/langchain-ai/langchain",
  ];

  const features = [
    { icon: Brain,         label: "AI Summary",      desc: "Instant purpose and scope breakdown powered by Gemini 2.5 Flash.", color: "text-cyan-400",    bg: "bg-cyan-400/10"    },
    { icon: Layers,        label: "Architecture",     desc: "Frontend, backend, database, and deployment patterns decoded.",   color: "text-violet-400",  bg: "bg-violet-400/10"  },
    { icon: BarChart2,     label: "Complexity score", desc: "Objective difficulty rating from Beginner to Enterprise level.",  color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: Wrench,        label: "Tech detection",   desc: "Auto-identify every library, framework, and config in the repo.", color: "text-orange-400",  bg: "bg-orange-400/10"  },
    { icon: Lightbulb,     label: "Improvements",     desc: "Security, performance, and scalability suggestions from AI.",     color: "text-rose-400",    bg: "bg-rose-400/10"    },
    { icon: MessageSquare, label: "Interview prep",   desc: "Project-specific technical questions for placement readiness.",   color: "text-cyan-400",    bg: "bg-cyan-400/10"    },
  ];

  const handleUrlChange = (val: string) => {
    setRepoUrl(val);
    if (urlError) setUrlError(null);
  };

  const handleAnalyze = async () => {
    const validationError = validateGithubUrl(repoUrl);
    if (validationError) { setUrlError(validationError); return; }
    setUrlError(null);
    try {
      setLoading(true);
      loadingToastId.current = toastLoading("Analyzing repository...");
      const response = await api.post("/repository/analyze", { repoUrl });
      if (loadingToastId.current !== null) removeToast(loadingToastId.current);
      success("Analysis complete!");
      setTimeout(() => navigate("/dashboard", { state: response.data.data }), 600);
    } catch (err: any) {
      if (loadingToastId.current !== null) removeToast(loadingToastId.current);
      error(err?.response?.data?.message ?? "Analysis failed. Check the URL and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAnalyze();
  };

  // Hero section reveal
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] z-0" />
      <div className="pointer-events-none absolute top-32 -right-24 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px] z-0" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/[0.06]">
        <span
          style={{
            transform: heroVisible ? "translateY(0)" : "translateY(-10px)",
            opacity: heroVisible ? 1 : 0,
            transition: "transform 0.5s ease, opacity 0.5s ease",
          }}
          className="text-xl font-bold tracking-tight text-zinc-100"
        >
          DevInsight<span className="text-cyan-400">AI</span>
        </span>
        <div
          style={{
            transform: heroVisible ? "translateY(0)" : "translateY(-10px)",
            opacity: heroVisible ? 1 : 0,
            transition: "transform 0.5s ease 0.1s, opacity 0.5s ease 0.1s",
          }}
          className="flex items-center gap-2 border border-white/10 bg-white/[0.04] rounded-lg px-3 py-1.5 text-xs text-zinc-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          GitHub Analysis
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-4">

        {/* Badge */}
        <div
          style={{
            transform: heroVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
            opacity: heroVisible ? 1 : 0,
            transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s, opacity 0.5s ease 0.1s",
          }}
          className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300 text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-8"
        >
          <Sparkles size={11} />
          AI Repository Intelligence
        </div>

        {/* Headline */}
        <h1
          style={{
            transform: heroVisible ? "translateY(0)" : "translateY(24px)",
            opacity: heroVisible ? 1 : 0,
            transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s, opacity 0.6s ease 0.2s",
          }}
          className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] max-w-4xl text-zinc-50"
        >
          Decode any{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            GitHub repo
          </span>
          <br />
          in seconds
        </h1>

        <p
          style={{
            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            opacity: heroVisible ? 1 : 0,
            transition: "transform 0.6s ease 0.35s, opacity 0.6s ease 0.35s",
          }}
          className="mt-5 max-w-xl text-sm md:text-base text-zinc-400 leading-relaxed"
        >
          Architecture breakdowns, tech stack detection, complexity scoring, and
          AI-generated interview prep — all from one URL.
        </p>

        {/* Input */}
        <div
          style={{
            transform: heroVisible ? "translateY(0)" : "translateY(20px)",
            opacity: heroVisible ? 1 : 0,
            transition: "transform 0.6s ease 0.45s, opacity 0.6s ease 0.45s",
          }}
          className="mt-10 w-full max-w-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div
              className={`
                flex flex-1 items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3.5
                focus-within:border-cyan-400/40 transition-all duration-300
                ${urlError ? "border-rose-400/50" : "border-white/10"}
              `}
            >
              <GitBranch size={16} className={urlError ? "text-rose-400 shrink-0" : "text-zinc-500 shrink-0"} />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://github.com/facebook/react"
                className="w-full bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600"
              />
              {repoUrl && (
                <button
                  onClick={() => { setRepoUrl(""); setUrlError(null); }}
                  className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Analyze button with glow pulse on hover */}
            <AnalyzeButton loading={loading} onClick={handleAnalyze} />
          </div>

          {urlError && (
            <div className="mt-2 flex items-center gap-1.5 text-rose-400 text-xs">
              <AlertCircle size={12} />
              {urlError}
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {examples.map((repo) => (
              <ExampleChip
                key={repo}
                repo={repo}
                onClick={() => { setRepoUrl(repo); setUrlError(null); }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Terminal */}
      <TerminalBlock heroVisible={heroVisible} />

      {/* Stats */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-3 gap-3">
          <StatCard val="10K+" label="Repos analyzed" color="text-cyan-400"    delay={0}   />
          <StatCard val="100+" label="Technologies"   color="text-violet-400"  delay={80}  />
          <StatCard val="<30s" label="Analysis time"  color="text-emerald-400" delay={160} />
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <FeatureCard key={f.label} {...f} delay={i * 60} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 flex justify-center py-16">
        <CtaButton loading={loading} onClick={handleAnalyze} />
      </section>
    </div>
  );
}

// ── Analyze button with glow ──────────────────────────────────────────────────
function AnalyzeButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: loading
          ? "rgba(255,255,255,0.1)"
          : "linear-gradient(135deg, #0891b2, #7c3aed)",
        transform: hovered && !loading ? "scale(1.04)" : "scale(1)",
        boxShadow: hovered && !loading
          ? "0 0 28px rgba(8,145,178,0.45), 0 0 60px rgba(124,58,237,0.2)"
          : "none",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
      }}
      className="shrink-0 rounded-xl px-7 py-3.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-[0.97]"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Analyzing...
        </span>
      ) : (
        "Analyze →"
      )}
    </button>
  );
}

// ── CTA button with magnetic feel ────────────────────────────────────────────
function CtaButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "scale(1.06)" : "scale(1)",
        boxShadow: hovered
          ? "0 0 36px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4)"
          : "0 4px 16px rgba(0,0,0,0.25)",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
      }}
      className="inline-flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold px-7 py-3.5 rounded-full active:scale-[0.97] disabled:opacity-50"
    >
      Get started free
      <ArrowRight
        size={15}
        style={{
          transform: hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 0.25s ease",
        }}
      />
    </button>
  );
}

// ── Terminal block with staggered line reveal ─────────────────────────────────
function TerminalBlock({ heroVisible }: { heroVisible: boolean }) {
  const lines = [
    { prefix: "text-cyan-400",    sym: "→", text: "Fetching repository tree ", dim: "github.com/vercel/next.js" },
    { prefix: "text-emerald-400", sym: "✓", text: "Detected ", hl: "12 technologies · 2,847 files" },
    { prefix: "text-emerald-400", sym: "✓", text: "Complexity level ", hl2: "Advanced", rest: " · Score 78/100" },
    { prefix: "text-cyan-400",    sym: "→", text: "Generating AI analysis ", dim2: "via Gemini 2.5 Flash", pulse: true },
  ];

  return (
    <section className="relative z-10 max-w-2xl mx-auto px-6 mt-12">
      <div className="bg-black/40 border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-[11px] text-zinc-600 ml-2">devinsight — analysis</span>
        </div>
        <div className="px-5 py-4 font-mono text-[11px] leading-[1.9] text-zinc-500">
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateX(0)" : "translateX(-8px)",
                transition: `opacity 0.5s ease ${0.6 + i * 0.12}s, transform 0.4s ease ${0.6 + i * 0.12}s`,
              }}
            >
              <span className={line.prefix}>{line.sym}</span>{" "}
              {line.text}
              {line.dim && <span className="text-zinc-700">{line.dim}</span>}
              {line.hl && <span className="text-zinc-300">{line.hl}</span>}
              {line.hl2 && <span className="text-violet-400">{line.hl2}</span>}
              {line.rest && line.rest}
              {line.dim2 && <span className="text-cyan-400">{line.dim2}</span>}
              {line.pulse && <span className="animate-pulse"> ...</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;