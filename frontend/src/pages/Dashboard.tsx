import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ExternalLink, Brain, Layers, Lightbulb,
  MessageSquare, FileCode, GitBranch, Files, Cpu,
  Copy, Check, ChevronDown, ChevronUp,
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.1) {
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-white/[0.05] animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-6 w-24 ml-auto" />
            <Skeleton className="h-10 w-16 ml-auto" />
          </div>
        </div>
        <Skeleton className="h-1.5 w-full mt-4" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, color 0.2s ease",
      }}
      className={`
        flex items-center gap-1.5 text-[11px] border rounded-md px-2 py-1 transition-colors
        ${hovered ? "text-zinc-300 border-white/[0.14]" : "text-zinc-500 border-white/[0.06]"}
      `}
      title="Copy to clipboard"
    >
      {copied ? (
        <><Check size={11} className="text-emerald-400" /> Copied</>
      ) : (
        <><Copy size={11} /> Copy</>
      )}
    </button>
  );
}

// ── Stat card with grayscale → color ──────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
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
          ? hovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)"
          : "translateY(20px) scale(0.97)",
        opacity: inView ? 1 : 0,
        filter: hovered ? "saturate(1) brightness(1)" : "saturate(0.15) brightness(0.6)",
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease, filter 0.35s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: hovered ? "0 0 24px rgba(34,211,238,0.08)" : "none",
      }}
      className={`
        bg-white/[0.03] border rounded-xl p-5 cursor-default
        ${hovered ? "border-white/20" : "border-white/[0.07]"}
      `}
    >
      <div className="flex items-center gap-2 text-zinc-600 mb-3">
        <Icon size={13} />
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
      </div>
      <div
        style={{ transition: "letter-spacing 0.3s ease" }}
        className={`text-2xl font-extrabold tracking-tight ${color}`}
      >
        {value}
      </div>
    </div>
  );
}

// ── Tech badge with individual hover ─────────────────────────────────────────
function TechBadge({ tech, colorClass, inView, delay }: {
  tech: string;
  colorClass: string;
  inView: boolean;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transitionDelay: inView ? `${delay}ms` : "0ms",
        transform: inView
          ? hovered ? "translateY(-3px) scale(1.07)" : "translateY(0) scale(1)"
          : "translateY(10px) scale(0.9)",
        opacity: inView ? 1 : 0,
        filter: hovered ? "saturate(1) brightness(1.1)" : "saturate(0.1) brightness(0.5)",
        transition:
          "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease, filter 0.3s ease",
        cursor: "default",
      }}
      className={`border text-[11px] font-medium px-2.5 py-1 rounded-md inline-block ${colorClass}`}
    >
      {tech}
    </span>
  );
}

// ── Important file row ────────────────────────────────────────────────────────
function FileRow({ file, inView, delay }: { file: string; inView: boolean; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transitionDelay: inView ? `${delay}ms` : "0ms",
        transform: inView
          ? hovered ? "translateX(5px)" : "translateX(0)"
          : "translateX(-10px)",
        opacity: inView ? 1 : 0,
        filter: hovered ? "saturate(1) brightness(1)" : "saturate(0) brightness(0.5)",
        transition:
          "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease, filter 0.35s ease, border-color 0.25s ease",
      }}
      className={`
        flex items-center gap-2.5 bg-white/[0.03] rounded-lg px-3 py-2 font-mono text-[11px] text-zinc-400
        border
        ${hovered ? "border-white/10" : "border-transparent"}
      `}
    >
      <FileCode size={11} className={hovered ? "text-cyan-400 shrink-0" : "text-zinc-600 shrink-0"} style={{ transition: "color 0.25s ease" }} />
      {file}
    </div>
  );
}

// ── Improvement card ──────────────────────────────────────────────────────────
function ImprovementCard({ item, index, inView }: {
  item: string;
  index: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transitionDelay: inView ? `${index * 60}ms` : "0ms",
        transform: inView
          ? hovered ? "translateY(-5px)" : "translateY(0)"
          : "translateY(16px)",
        opacity: inView ? 1 : 0,
        filter: hovered ? "saturate(1) brightness(1)" : "saturate(0.2) brightness(0.65)",
        boxShadow: hovered ? "0 0 20px rgba(52,211,153,0.08)" : "none",
        transition:
          "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease, filter 0.3s ease, border-color 0.25s ease, box-shadow 0.3s ease",
      }}
      className={`
        border rounded-xl p-4 bg-white/[0.03]
        ${hovered ? "border-emerald-400/20" : "border-white/[0.06]"}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          Suggestion {String(index + 1).padStart(2, "0")}
        </div>
        <CopyButton text={item} />
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{item}</p>
    </div>
  );
}

// ── Interview question row ────────────────────────────────────────────────────
function QuestionRow({ question, index, inView }: {
  question: string;
  index: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transitionDelay: inView ? `${index * 50}ms` : "0ms",
        transform: inView
          ? hovered ? "translateX(4px)" : "translateX(0)"
          : "translateX(-12px)",
        opacity: inView ? 1 : 0,
        filter: hovered ? "saturate(1) brightness(1)" : "saturate(0.2) brightness(0.6)",
        boxShadow: hovered ? "0 0 20px rgba(167,139,250,0.07)" : "none",
        transition:
          "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease, filter 0.3s ease, border-color 0.25s ease, box-shadow 0.3s ease",
      }}
      className={`
        flex gap-4 bg-white/[0.03] border rounded-xl p-4
        ${hovered ? "border-violet-400/20" : "border-white/[0.06]"}
      `}
    >
      <span
        style={{ transition: "color 0.25s ease" }}
        className={`text-sm font-bold shrink-0 mt-0.5 ${hovered ? "text-violet-300" : "text-cyan-400"}`}
      >
        Q{index + 1}
      </span>
      <p className="text-sm text-zinc-400 leading-relaxed flex-1">{question}</p>
      <div className="shrink-0">
        <CopyButton text={question} />
      </div>
    </div>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────
function CollapsibleSection({
  title,
  icon,
  iconColor,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      style={{
        transform: inView ? "translateY(0)" : "translateY(20px)",
        opacity: inView ? 1 : 0,
        transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease",
      }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
          transition: "background 0.2s ease",
        }}
        className="w-full flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
          <span
            style={{
              transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
              transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
            className={iconColor}
          >
            {icon}
          </span>
          {title}
        </div>
        <span
          style={{
            transform: hovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.25s ease, color 0.2s ease",
            color: hovered ? "#a1a1aa" : "#52525b",
          }}
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function Dashboard() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const [ready, setReady] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
            <GitBranch className="text-zinc-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">No analysis found</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Paste a GitHub URL on the home page to get started.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </button>
        </div>
      </div>
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const complexityColors: Record<string, { text: string; border: string; bg: string }> = {
    Beginner:     { text: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10" },
    Intermediate: { text: "text-cyan-400",    border: "border-cyan-400/30",    bg: "bg-cyan-400/10"    },
    Advanced:     { text: "text-violet-400",  border: "border-violet-400/30",  bg: "bg-violet-400/10"  },
    Enterprise:   { text: "text-rose-400",    border: "border-rose-400/30",    bg: "bg-rose-400/10"    },
  };
  const lvl = complexityColors[state.complexityLevel] ?? complexityColors["Advanced"];

  const techColors = [
    "bg-cyan-400/10    text-cyan-400    border-cyan-400/20",
    "bg-violet-400/10  text-violet-400  border-violet-400/20",
    "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    "bg-orange-400/10  text-orange-400  border-orange-400/20",
  ];

  const handleCopyAll = async (items: string[], label: string) => {
    try {
      await navigator.clipboard.writeText(items.join("\n\n"));
      success(`All ${label} copied!`);
    } catch { error("Clipboard access denied."); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.07] blur-[100px] z-0" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-violet-500/[0.07] blur-[100px] z-0" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-white/[0.06]">
        <span className="text-xl font-bold tracking-tight">
          DevInsight<span className="text-cyan-400">AI</span>
        </span>
        <NavBackButton onClick={() => navigate("/")} />
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-8 space-y-5">

        {!ready ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* ── Repo Hero Card ────────────────────────────────────────── */}
            <HeroCard state={state} lvl={lvl} />

            {/* ── Stats Row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Files}     label="Files"        value={state.filesCount}                  color="text-cyan-400"    delay={0}   />
              <StatCard icon={Cpu}       label="Technologies" value={state.detectedTechnologies.length} color="text-violet-400"  delay={60}  />
              <StatCard icon={GitBranch} label="Branch"       value={state.defaultBranch}               color="text-zinc-200"    delay={120} />
              <StatCard icon={FileCode}  label="Key files"    value={state.importantFiles.length}       color="text-emerald-400" delay={180} />
            </div>

            {/* ── AI Summary + Tech Stack ────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-5">

              <CollapsibleSection
                title="AI Summary"
                icon={<Brain size={13} />}
                iconColor="text-cyan-400"
              >
                <div className="flex justify-end mb-3">
                  <CopyButton text={state.aiAnalysis.summary} />
                </div>
                <p className="text-sm text-zinc-400 leading-[1.85]">
                  {state.aiAnalysis.summary}
                </p>
              </CollapsibleSection>

              <CollapsibleSection
                title="Tech Stack"
                icon={<Layers size={13} />}
                iconColor="text-violet-400"
              >
                <TechStackSection
                  technologies={state.detectedTechnologies}
                  importantFiles={state.importantFiles}
                  techColors={techColors}
                />
              </CollapsibleSection>
            </div>

            {/* ── Architecture ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Architecture Analysis"
              icon={<Layers size={13} />}
              iconColor="text-cyan-400"
            >
              <div className="flex justify-end mb-3">
                <CopyButton text={state.aiAnalysis.architecture} />
              </div>
              <p className="text-sm text-zinc-400 leading-[1.85] whitespace-pre-line">
                {state.aiAnalysis.architecture}
              </p>
            </CollapsibleSection>

            {/* ── Improvements ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Improvement Suggestions"
              icon={<Lightbulb size={13} />}
              iconColor="text-emerald-400"
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleCopyAll(state.aiAnalysis.improvements, "suggestions")}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 border border-white/[0.06] hover:border-white/[0.12] rounded-md px-2 py-1 transition-colors"
                >
                  <Copy size={11} /> Copy all
                </button>
              </div>
              <ImprovementsGrid improvements={state.aiAnalysis.improvements} />
            </CollapsibleSection>

            {/* ── Interview Questions ─────────────────────────────────────── */}
            <CollapsibleSection
              title="Interview Questions"
              icon={<MessageSquare size={13} />}
              iconColor="text-violet-400"
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleCopyAll(state.aiAnalysis.interviewQuestions, "questions")}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 border border-white/[0.06] hover:border-white/[0.12] rounded-md px-2 py-1 transition-colors"
                >
                  <Copy size={11} /> Copy all
                </button>
              </div>
              <InterviewList questions={state.aiAnalysis.interviewQuestions} />
            </CollapsibleSection>

            <div className="h-10" />
          </>
        )}
      </div>
    </div>
  );
}

// ── Nav back button ───────────────────────────────────────────────────────────
function NavBackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateX(-2px)" : "translateX(0)",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease, color 0.2s ease, background 0.2s ease",
      }}
      className={`
        inline-flex items-center gap-2 border bg-white/[0.04] text-xs px-4 py-2 rounded-lg
        ${hovered ? "border-white/20 text-zinc-200 bg-white/[0.07]" : "border-white/10 text-zinc-400"}
      `}
    >
      <ArrowLeft
        size={13}
        style={{
          transform: hovered ? "translateX(-2px)" : "translateX(0)",
          transition: "transform 0.25s ease",
        }}
      />
      Analyze new repo
    </button>
  );
}

// ── Hero card with progress bar animation ─────────────────────────────────────
function HeroCard({ state, lvl }: { state: any; lvl: any }) {
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView();
  const [barAnimated, setBarAnimated] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setBarAnimated(true), 300);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: inView ? "translateY(0)" : "translateY(20px)",
        opacity: inView ? 1 : 0,
        boxShadow: hovered ? "0 0 40px rgba(34,211,238,0.06)" : "none",
        transition:
          "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, border-color 0.3s ease, box-shadow 0.35s ease",
      }}
      className={`
        bg-white/[0.03] border rounded-2xl p-6 md:p-8
        ${hovered ? "border-white/[0.14]" : "border-white/[0.08]"}
      `}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-50">
            {state.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Owner: <span className="text-zinc-400">{state.owner}</span>
            {" · "}
            Provider: <span className="text-zinc-400">{state.provider}</span>
          </p>
          <a
            href={state.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm mt-3 transition-colors group"
          >
            View on GitHub
            <ExternalLink
              size={13}
              style={{ transition: "transform 0.2s ease" }}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-3 py-1.5 rounded-lg ${lvl.text} ${lvl.border} ${lvl.bg}`}>
            {state.complexityLevel}
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-violet-400">
            {state.complexityScore}
            <span className="text-sm font-normal text-zinc-600"> / 100</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span className="uppercase tracking-widest">Complexity score</span>
          <span className="text-zinc-400 font-medium">{state.complexityScore} / 100</span>
        </div>
        <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
          <div
            style={{
              width: barAnimated ? `${state.complexityScore}%` : "0%",
              background: "linear-gradient(90deg, #22d3ee, #a78bfa)",
              transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
            }}
            className="h-full rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

// ── Tech stack + files (extracted so we can use inView inside collapsible) ────
function TechStackSection({ technologies, importantFiles, techColors }: {
  technologies: string[];
  importantFiles: string[];
  techColors: string[];
}) {
  const { ref, inView } = useInView();

  return (
    <div ref={ref}>
      <div className="flex flex-wrap gap-2 mb-6">
        {technologies.map((tech: string, i: number) => (
          <TechBadge
            key={tech}
            tech={tech}
            colorClass={techColors[i % techColors.length]}
            inView={inView}
            delay={i * 40}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 mb-3">
        <FileCode size={13} className="text-zinc-400" />
        Important Files
      </div>
      <div className="space-y-1.5">
        {importantFiles.map((file: string, i: number) => (
          <FileRow key={file} file={file} inView={inView} delay={i * 50} />
        ))}
      </div>
    </div>
  );
}

// ── Improvements grid ─────────────────────────────────────────────────────────
function ImprovementsGrid({ improvements }: { improvements: string[] }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-3">
      {improvements.map((item: string, index: number) => (
        <ImprovementCard key={index} item={item} index={index} inView={inView} />
      ))}
    </div>
  );
}

// ── Interview list ────────────────────────────────────────────────────────────
function InterviewList({ questions }: { questions: string[] }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className="space-y-3">
      {questions.map((question: string, index: number) => (
        <QuestionRow key={index} question={question} index={index} inView={inView} />
      ))}
    </div>
  );
}

export default Dashboard;