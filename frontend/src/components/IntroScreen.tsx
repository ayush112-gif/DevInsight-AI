import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  onFinish: () => void;
}

const scanLines = [
  { file: "package.json",        type: "config" },
  { file: "README.md",           type: "doc"    },
  { file: "tsconfig.json",       type: "config" },
  { file: "src/components/",     type: "dir"    },
  { file: "tailwind.config.js",  type: "config" },
  { file: "src/services/api.ts", type: "code"   },
  { file: ".env.example",        type: "config" },
];

const analysisSteps = [
  { label: "Detecting technologies",     done: true  },
  { label: "Analyzing architecture",     done: true  },
  { label: "Generating AI summary",      done: true  },
  { label: "Creating interview questions", done: false },
];

const typeColors: Record<string, string> = {
  config: "text-orange-400",
  doc:    "text-cyan-400",
  dir:    "text-violet-400",
  code:   "text-emerald-400",
};

function IntroScreen({ onFinish }: Props) {
  const [step, setStep] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1800),
      setTimeout(() => setStep(2), 4200),
      setTimeout(() => setStep(3), 6800),
      setTimeout(() => onFinish(), 9200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  // Stagger scan lines during step 1
  useEffect(() => {
    if (step !== 1) return;
    setVisibleLines(0);
    scanLines.forEach((_, i) => {
      const t = setTimeout(() => setVisibleLines(i + 1), i * 260);
      return () => clearTimeout(t);
    });
  }, [step]);

  // Animate progress bar during step 2
  useEffect(() => {
    if (step !== 2) return;
    setProgressWidth(0);
    const t = setTimeout(() => setProgressWidth(100), 80);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-100 flex items-center justify-center overflow-hidden">

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.09] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/[0.09] blur-[120px]" />

      {/* Step content */}
      <div className="relative z-10 w-full max-w-lg px-6 text-center">

        {/* ── Step 0 : Logo reveal ─────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07] mb-7"
              >
                {/* Simple code-bracket icon via SVG */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </motion.div>

              <h1 className="text-5xl font-extrabold tracking-tighter text-zinc-50">
                DevInsight<span className="text-cyan-400">AI</span>
              </h1>
              <p className="mt-3 text-sm text-zinc-500 tracking-widest uppercase">
                AI Repository Intelligence
              </p>

              {/* Pulse ring */}
              <motion.div
                className="mt-8 inline-flex"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                <span className="text-[11px] text-zinc-600 font-mono">Initializing...</span>
              </motion.div>
            </motion.div>
          )}

          {/* ── Step 1 : File scan ──────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-3">Repository scan</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 mb-7">
                Reading file tree
              </h2>

              {/* Terminal window */}
              <div className="bg-black/50 border border-white/[0.07] rounded-xl overflow-hidden text-left">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-zinc-600 ml-2 font-mono">devinsight — scan</span>
                </div>
                <div className="px-5 py-4 font-mono text-xs space-y-1.5">
                  {scanLines.slice(0, visibleLines).map((line) => (
                    <motion.div
                      key={line.file}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-emerald-400">✓</span>
                      <span className={typeColors[line.type]}>{line.file}</span>
                    </motion.div>
                  ))}
                  {visibleLines < scanLines.length && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-2 h-3.5 bg-cyan-400 align-middle"
                    />
                  )}
                </div>
              </div>

              <p className="mt-4 text-[11px] text-zinc-600 font-mono">
                {visibleLines} / {scanLines.length} files indexed
              </p>
            </motion.div>
          )}

          {/* ── Step 2 : AI analysis ────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-3">Gemini 2.5 Flash</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 mb-7">
                AI analysis running
              </h2>

              {/* Steps list */}
              <div className="space-y-3 mb-7 text-left">
                {analysisSteps.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.18, duration: 0.3 }}
                    className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3"
                  >
                    {s.done ? (
                      <span className="text-emerald-400 text-sm">✓</span>
                    ) : (
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 rounded-full bg-cyan-400"
                      />
                    )}
                    <span className={`text-sm ${s.done ? "text-zinc-400" : "text-zinc-200"}`}>
                      {s.label}
                    </span>
                    {!s.done && (
                      <span className="ml-auto text-[10px] text-cyan-400 font-mono animate-pulse">running</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#22d3ee,#a78bfa)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-600 font-mono text-right">
                Processing...
              </p>
            </motion.div>
          )}

          {/* ── Step 3 : Finale ─────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glow badge */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300 text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-7"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                Analysis complete
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.05] text-zinc-50"
              >
                Understand any{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#22d3ee,#a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  codebase
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-base text-zinc-500"
              >
                In seconds, not hours.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex justify-center gap-4 text-[11px] font-mono text-zinc-600"
              >
                <span className="text-emerald-400">✓</span> Tech detected ·{" "}
                <span className="text-emerald-400">✓</span> Architecture mapped ·{" "}
                <span className="text-emerald-400">✓</span> Questions ready
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button — always visible */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onFinish}
          className="mt-12 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors tracking-widest uppercase font-mono"
        >
          Skip intro →
        </motion.button>
      </div>
    </div>
  );
}

export default IntroScreen;