"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Checkbox } from "@/components/ui";
import { Eye, EyeOff, IndianRupee, ArrowRight, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { authService, type UserCreate, type SignupResponse } from "@/lib/auth";
import { ApiException } from "@/lib/api";
import { EmailVerificationModal } from "@/components/auth";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import {
  validatePasswordStrength, validateFullName,
  validateIndianPhone, validateEmail, normalizePhoneNumber,
} from "@/lib/validation";

// ─── Character palette (shared with signin) ───────────────────────────────────
const C = {
  indigo: "#6366F1",
  slate: "#0F172A",
  teal: "#14B8A6",
  amber: "#F59E0B",
  pupil: "#F8FAFC",
  dark: "#0F172A",
} as const;

// ─── Eye primitives ───────────────────────────────────────────────────────────
interface PupilProps {
  size?: number; maxDistance?: number; pupilColor?: string;
  forceLookX?: number; forceLookY?: number;
}
const Pupil = ({
  size = 12, maxDistance = 5, pupilColor = C.dark, forceLookX, forceLookY,
}: PupilProps) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * dist, y: Math.sin(a) * dist };
  })();
  return (
    <div ref={ref} className="rounded-full" style={{
      width: size, height: size, backgroundColor: pupilColor,
      transform: `translate(${pos.x}px,${pos.y}px)`,
      transition: "transform 0.1s ease-out",
    }} />
  );
};

interface EyeBallProps {
  size?: number; pupilSize?: number; maxDistance?: number;
  eyeColor?: string; pupilColor?: string; isBlinking?: boolean;
  forceLookX?: number; forceLookY?: number;
}
const EyeBall = ({
  size = 48, pupilSize = 16, maxDistance = 10,
  eyeColor = "rgba(255,255,255,0.92)", pupilColor = C.dark,
  isBlinking = false, forceLookX, forceLookY,
}: EyeBallProps) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * dist, y: Math.sin(a) * dist };
  })();
  return (
    <div ref={ref} className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: "hidden" }}>
      {!isBlinking && (
        <div className="rounded-full" style={{
          width: pupilSize, height: pupilSize, backgroundColor: pupilColor,
          transform: `translate(${pos.x}px,${pos.y}px)`,
          transition: "transform 0.1s ease-out",
        }} />
      )}
    </div>
  );
};

// ─── AI prompt placeholders ───────────────────────────────────────────────────
const AI_PROMPTS = [
  "Build my FIRE plan from scratch",
  "What's the best tax regime for ₹15L income?",
  "Analyse overlap in my mutual funds",
  "How to invest my ₹5L bonus?",
  "Optimise HRA + NPS for a couple",
];

// ─── Inline field error ───────────────────────────────────────────────────────
function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-destructive mt-1">
      <AlertCircle className="size-3 flex-shrink-0" />
      {msg}
    </p>
  );
}

// ─── Password strength meter ──────────────────────────────────────────────────
function StrengthMeter({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["var(--destructive)", "var(--warning)", "var(--primary)", "var(--success)"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score - 1] : "var(--border)" }} />
        ))}
      </div>
      <p className="text-[10px] font-medium transition-colors"
        style={{ color: score > 0 ? colors[score - 1] : "var(--muted-foreground)" }}>
        {score > 0 ? labels[score - 1] : "Enter a password"}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AnimatedSignup() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [signupResponse, setSignupResponse] = useState<SignupResponse | null>(null);

  // Field errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Character state
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isIndigoBlinking, setIsIndigoBlinking] = useState(false);
  const [isSlateBlinking, setIsSlateBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isIndigoPeeking, setIsIndigoPeeking] = useState(false);

  const indigoRef = useRef<HTMLDivElement>(null);
  const slateRef = useRef<HTMLDivElement>(null);
  const tealRef = useRef<HTMLDivElement>(null);
  const amberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authService.isAuthenticated()) router.replace("/dashboard");
    else setChecking(false);
  }, [router]);

  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useEffect(() => {
    const loop = (set: (v: boolean) => void) => {
      const t = setTimeout(() => {
        set(true);
        setTimeout(() => { set(false); loop(set); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t1 = loop(setIsIndigoBlinking);
    const t2 = loop(setIsSlateBlinking);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    } else setIsLookingAtEachOther(false);
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsIndigoPeeking(true);
        setTimeout(() => setIsIndigoPeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    } else setIsIndigoPeeking(false);
  }, [password, showPassword, isIndigoPeeking]);

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2);
    const dy = mouseY - (r.top + r.height / 3);
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const ip = calcPos(indigoRef);
  const sp = calcPos(slateRef);
  const tp = calcPos(tealRef);
  const ap = calcPos(amberRef);

  const hidingPassword = password.length > 0 && !showPassword;
  const showingPassword = password.length > 0 && showPassword;

  // Validation
  const handleNameChange = (v: string) => { setName(v); const r = validateFullName(v); setNameError(r.isValid ? "" : r.error || ""); };
  const handleEmailChange = (v: string) => { setEmail(v); const r = validateEmail(v); setEmailError(r.isValid ? "" : r.error || ""); };
  const handlePhoneChange = (v: string) => { setPhone(v); const r = validateIndianPhone(v); setPhoneError(r.isValid ? "" : r.error || ""); };
  const handlePasswordChange = (v: string) => { setPassword(v); const r = validatePasswordStrength(v); setPasswordError(r.isValid ? "" : r.error || ""); };

  const validateForm = () => {
    const nv = validateFullName(name); const ev = validateEmail(email);
    const pv = validateIndianPhone(phone); const pw = validatePasswordStrength(password);
    setNameError(nv.isValid ? "" : nv.error || "");
    setEmailError(ev.isValid ? "" : ev.error || "");
    setPhoneError(pv.isValid ? "" : pv.error || "");
    setPasswordError(pw.isValid ? "" : pw.error || "");
    return nv.isValid && ev.isValid && pv.isValid && pw.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) { setError("Please fix the errors above before continuing."); return; }
    setIsLoading(true);
    try {
      const res = await authService.signup({
        full_name: name, email, password,
        phone: phone ? normalizePhoneNumber(phone) : undefined,
      } as UserCreate);
      setSignupResponse(res);
      setShowVerificationModal(true);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.error?.error || err.error?.toString() || "Signup failed. Please try again.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else setError("An unexpected error occurred.");
    } finally { setIsLoading(false); }
  };

  const handleAiSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  if (checking) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── LEFT PANEL — always dark ── */}
      <div
        className="dark bg-background relative hidden lg:flex flex-col justify-between p-12 overflow-hidden grain"
      >
        {/* Dot grid — dark variant */}
        <div className="dot-grid absolute inset-0" />
        {/* Hero glow top-left */}
        <div className="hero-glow absolute inset-0" />
        {/* Ambient bottom-right */}
        <div className="absolute inset-0 pointer-events-none"
          // style={{ background: "radial-gradient(ellipse 60% 40% at 85% 90%, oklch(0.72 0.18 198 / 0.10) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-20 flex items-center gap-2.5 text-lg font-semibold">
          <div className="size-9 rounded-xl flex items-center justify-center glow-primary"
            style={{ background: "var(--primary-subtle)", border: "1px solid var(--primary-muted)" }}>
            <IndianRupee className="size-4 text-primary" />
          </div>
          <span style={{
            background: `linear-gradient(135deg,
                          var(--foreground) 0%,
                          var(--primary) 60%,
                          oklch(0.62 0.14 198) 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
            className="font-bold">Money Mentor</span>
        </div>

        {/* Characters */}
        <div className="relative z-20 flex items-end justify-center" style={{ height: "380px" }}>
          <div className="relative" style={{ width: "550px", height: "360px" }}>

            {/* Indigo tall rect */}
            <div ref={indigoRef} className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-(--shadow-glow-sm)"
              style={{
                left: "70px", width: "180px",
                height: (isTyping || hidingPassword) ? "420px" : "380px",
                backgroundColor: "var(--chart-4)", borderRadius: "10px 10px 0 0", zIndex: 1,
                transform: showingPassword
                  ? "skewX(0deg)"
                  : (isTyping || hidingPassword)
                    ? `skewX(${(ip.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${ip.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
                // boxShadow: "var(--shadow-lg)"
              }}>
              <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: showingPassword ? "20px" : isLookingAtEachOther ? "55px" : `${45 + ip.faceX}px`,
                  top: showingPassword ? "35px" : isLookingAtEachOther ? "65px" : `${40 + ip.faceY}px`,
                }}>
                {[0, 1].map((k) => (
                  <EyeBall key={k} size={18} pupilSize={7} maxDistance={5}
                    eyeColor="white" pupilColor="var(--surface-3)"
                    isBlinking={isIndigoBlinking}
                    forceLookX={showingPassword ? (isIndigoPeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                    forceLookY={showingPassword ? (isIndigoPeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Slate mid rect */}
            <div ref={slateRef} className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-(--shadow-glow-sm)"
              style={{
                left: "240px", width: "120px", height: "290px",
                backgroundColor: "var(--surface-3)", borderRadius: "8px 8px 0 0", zIndex: 2,
                transform: showingPassword
                  ? "skewX(0deg)"
                  : isLookingAtEachOther
                    ? `skewX(${(sp.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || hidingPassword)
                      ? `skewX(${(sp.bodySkew || 0) * 1.5}deg)`
                      : `skewX(${sp.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
                border: "1px solid oklch(1 0 0 / 0.08)",
              }}>
              <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: showingPassword ? "10px" : isLookingAtEachOther ? "32px" : `${26 + sp.faceX}px`,
                  top: showingPassword ? "28px" : isLookingAtEachOther ? "12px" : `${32 + sp.faceY}px`,
                }}>
                {[0, 1].map((k) => (
                  <EyeBall key={k} size={16} pupilSize={6} maxDistance={4}
                    eyeColor="rgba(255,255,255,0.90)" pupilColor="var(--surface-3)"
                    isBlinking={isSlateBlinking}
                    forceLookX={showingPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
                    forceLookY={showingPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Teal wide dome */}
            <div ref={tealRef} className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-(--shadow-glow-sm)"
              style={{
                left: "0px", width: "240px", height: "190px",
                backgroundColor: "var(--chart-1)", borderRadius: "120px 120px 0 0", zIndex: 3,
                transform: showingPassword ? "skewX(0deg)" : `skewX(${tp.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
                boxShadow: "0 -4px 32px oklch(0.68 0.22 168 / 0.28)",
              }}>
              <div className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: showingPassword ? "50px" : `${82 + (tp.faceX || 0)}px`,
                  top: showingPassword ? "85px" : `${90 + (tp.faceY || 0)}px`,
                }}>
                {[0, 1].map((k) => (
                  <Pupil key={k} size={12} maxDistance={5} pupilColor="var(--surface-3)"
                    forceLookX={showingPassword ? -5 : undefined}
                    forceLookY={showingPassword ? -4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Amber tall dome */}
            <div ref={amberRef} className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-(--shadow-glow-sm)"
              style={{
                left: "310px", width: "140px", height: "220px",
                backgroundColor: "var(--chart-5)", borderRadius: "70px 70px 0 0", zIndex: 4,
                transform: showingPassword ? "skewX(0deg)" : `skewX(${ap.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}>
              <div className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: showingPassword ? "20px" : `${52 + (ap.faceX || 0)}px`,
                  top: showingPassword ? "35px" : `${40 + (ap.faceY || 0)}px`,
                }}>
                {[0, 1].map((k) => (
                  <Pupil key={k} size={12} maxDistance={5} pupilColor="var(--surface-3)"
                    forceLookX={showingPassword ? -5 : undefined}
                    forceLookY={showingPassword ? -4 : undefined}
                  />
                ))}
              </div>
              <div className="absolute rounded-full transition-all duration-200 ease-out"
                style={{
                  width: "80px", height: "4px", backgroundColor: C.dark,
                  left: showingPassword ? "10px" : `${40 + (ap.faceX || 0)}px`,
                  top: showingPassword ? "88px" : `${88 + (ap.faceY || 0)}px`,
                }} />
            </div>
          </div>
        </div>

        {/* AI prompt teaser */}
        <div className="relative z-20 space-y-3">
          <p className="text-eyebrow text-center">Ask our AI anything</p>
          <PlaceholdersAndVanishInput
            placeholders={AI_PROMPTS}
            onChange={() => { }}
            onSubmit={handleAiSubmit}
          />
          <p className="text-center text-[11px] text-white/40">
            Sign up to unlock personalised financial AI →
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-20 flex items-center gap-8 text-sm text-white/40">
          {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
            <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — scrollable form ── */}
      <div className="relative flex items-start justify-center p-8 py-10 bg-background overflow-auto min-h-screen">
        {/* Dot grid texture */}
        <div className="absolute inset-0 dot-grid-fine opacity-40 pointer-events-none" />
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none hero-glow"
        // style={{ background: "radial-gradient(ellipse 70% 40% at 80% -5%, var(--primary-subtle) 0%, transparent 70%)" }} 
        />

        <div className="relative w-full max-w-105 z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-10">
            <div className="size-8 rounded-lg flex items-center justify-center glow-primary"
              style={{ background: "var(--primary-subtle)", border: "1px solid var(--primary-muted)" }}>
              <IndianRupee className="size-4 text-primary" />
            </div>
            <span className="text-foreground font-bold">Money Mentor</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-eyebrow mb-2">Get started</p>
            <h1 className="text-display-sm" style={{
              background: `linear-gradient(135deg,
                          var(--foreground) 0%,
                          var(--primary) 60%,
                          oklch(0.62 0.14 198) 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}>Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1.5">Start your financial journey today</p>
          </div>

          {/* Form card */}
          <div className="card-elevated rounded-2xl p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Full Name
                </Label>
                <div className="surface-inset rounded-xl px-3.5 h-12 flex items-center
                  border border-border-subtle focus-within:border-primary focus-within:ring-1
                  focus-within:ring-primary/30 transition-all duration-150">
                  <Input id="name" type="text" placeholder="Arjun Sharma"
                    value={name} autoComplete="off"
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="flex-1 h-full bg-transparent border-none shadow-none
                      focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-0"
                  />
                </div>
                <FieldError msg={nameError} />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <div className="surface-inset rounded-xl px-3.5 h-12 flex items-center
                  border border-border-subtle focus-within:border-primary focus-within:ring-1
                  focus-within:ring-primary/30 transition-all duration-150">
                  <Input id="email" type="email" placeholder="your@email.com"
                    value={email} autoComplete="off"
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="flex-1 h-full bg-transparent border-none shadow-none
                      focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-0"
                  />
                </div>
                <FieldError msg={emailError} />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Phone <span className="font-normal normal-case tracking-normal">(optional)</span>
                </Label>
                <div className="surface-inset rounded-xl px-3.5 h-12 flex items-center
                  border border-border-subtle focus-within:border-primary focus-within:ring-1
                  focus-within:ring-primary/30 transition-all duration-150">
                  <Input id="phone" type="tel" placeholder="+91 98765 43210"
                    value={phone} autoComplete="off"
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="flex-1 h-full bg-transparent border-none shadow-none
                      focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-0"
                  />
                </div>
                <FieldError msg={phoneError} />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Password
                </Label>
                <div className="surface-inset rounded-xl px-3.5 h-12 flex items-center gap-2.5
                  border border-border-subtle focus-within:border-primary focus-within:ring-1
                  focus-within:ring-primary/30 transition-all duration-150">
                  <Input id="password" type={showPassword ? "text" : "password"}
                    placeholder="••••••••" value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="flex-1 h-full bg-transparent border-none shadow-none
                      focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-0"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <StrengthMeter password={password} />
                <FieldError msg={passwordError} />
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-xs font-normal cursor-pointer text-muted-foreground">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                </Label>
              </div>

              {/* Form-level error — badge-destructive pattern */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl text-sm badge-destructive border">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Submit — glow-primary */}
              <button
                type="submit" disabled={isLoading}
                className="w-full h-12 rounded-xl text-sm font-semibold
                  bg-primary text-primary-foreground glow-primary
                  hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 transition-all duration-200"
              >
                {isLoading ? "Creating account…" : (
                  <><span>Create account</span><ArrowRight className="size-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            {/* <div className="flex items-center gap-3">
              <div className="flex-1 divider-gradient" />
              <span className="text-[11px] text-muted-foreground">or continue with</span>
              <div className="flex-1 divider-gradient" />
            </div> */}

            {/* Google — glass */}
            {/* <button type="button"
              className="w-full h-11 rounded-xl text-sm font-medium glass
                flex items-center justify-center gap-2.5
                hover:bg-primary-subtle transition-all duration-200 text-foreground">
              <Mail className="size-4" />
              Sign up with Google
            </button> */}
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Verification modal (unchanged logic) */}
      {showVerificationModal && signupResponse && (
        <EmailVerificationModal
          open={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          signupResponse={signupResponse}
          onSuccess={() => router.push("/profile")}
        />
      )}
    </div>
  );
}
