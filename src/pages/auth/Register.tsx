import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Chrome, Check } from "lucide-react";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    else if (name.trim().length > 100) errs.name = "Name must be under 100 characters";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (!passwordRules.every((r) => r.test(password))) errs.password = "Password doesn't meet requirements";
    if (!agreed) errs.agreed = "You must accept the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) navigate("/app");
  };

  const clearError = (field: string) => setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-accent/15 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <a href="/" className="font-display text-4xl font-bold text-foreground tracking-tight">
            Quittr<span className="text-primary">App</span>
          </a>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Join thousands who've taken the first step toward a better life. Your journey starts today.
          </p>
          <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
            {["Track your progress daily", "Learn from 100+ expert lessons", "24/7 AI companion support", "Join a supportive community"].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <a href="/" className="font-display text-2xl font-bold text-foreground tracking-tight">
              Quittr<span className="text-primary">App</span>
            </a>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start your recovery journey for free</p>
          </div>

          {/* Social */}
          <div className="space-y-2.5 mb-6">
            <Button variant="outline" className="w-full border-border/40 bg-secondary/30 hover:bg-secondary/50 text-foreground text-sm h-11">
              <Chrome className="w-4 h-4 mr-2" /> Sign up with Google
            </Button>
            <Button variant="outline" className="w-full border-border/40 bg-secondary/30 hover:bg-secondary/50 text-foreground text-sm h-11">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              Sign up with Apple
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="John Doe" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} className={`pl-10 bg-secondary/40 border-border/30 h-11 ${errors.name ? "border-destructive" : ""}`} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} className={`pl-10 bg-secondary/40 border-border/30 h-11 ${errors.email ? "border-destructive" : ""}`} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); clearError("password"); }} className={`pl-10 pr-10 bg-secondary/40 border-border/30 h-11 ${errors.password ? "border-destructive" : ""}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              {password && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {passwordRules.map((r) => (
                    <div key={r.label} className={`flex items-center gap-1.5 text-[11px] ${r.test(password) ? "text-green-400" : "text-muted-foreground"}`}>
                      <Check className={`w-3 h-3 ${r.test(password) ? "" : "opacity-30"}`} /> {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => { setAgreed(!!v); clearError("agreed"); }} className="mt-0.5" />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.agreed && <p className="text-xs text-destructive">{errors.agreed}</p>}

            <Button type="submit" className="w-full bg-gradient-purple text-primary-foreground h-11 text-sm font-medium">
              Create Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
