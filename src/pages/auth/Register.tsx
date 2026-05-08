import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SocialAuth } from "@/components/auth/SocialAuth";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [madhab, setMadhab] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeShariah, setAgreeShariah] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    else if (name.trim().length > 100) errs.name = "Name must be under 100 characters";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (!passwordRules.every((r) => r.test(password))) errs.password = "Password doesn't meet requirements";
    if (!agreeShariah) errs.agreeShariah = "You must agree to Shariah rules";
    if (!ageConfirmed) errs.ageConfirmed = "You must confirm you are 13 or older";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signUp(email, password, {
        full_name: name,
        city: city,
        madhab: madhab,
        age_confirmed: ageConfirmed,
        shariah_rules_agreed: agreeShariah,
      });
      toast.success("Account created successfully!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: string) => setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-emerald-900/20 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-emerald-600/20 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-amber-500/15 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <a href="/" className="font-display text-4xl font-bold text-foreground tracking-tight">
            The Momin<span className="text-emerald-600">Core</span>
          </a>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            A halal-first, productivity-first, safe social + learning platform for the global Muslim ummah.
          </p>
          <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
            {["Safe halal content environment", "Productivity tracking & growth", "Quran & Islamic library", "Supportive Muslim community"].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-emerald-600/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" />
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
              The Momin<span className="text-emerald-600">Core</span>
            </a>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join the safe, productive Muslim community</p>
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
              <Label className="text-sm text-foreground">City (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Your city" value={city} onChange={(e) => { setCity(e.target.value); clearError("city"); }} className="pl-10 bg-secondary/40 border-border/30 h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground">Madhab (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={madhab}
                  onChange={(e) => { setMadhab(e.target.value); clearError("madhab"); }}
                  className="pl-10 bg-secondary/40 border-border/30 h-11 w-full rounded-md px-3 text-sm"
                >
                  <option value="">Select your madhab</option>
                  <option value="hanafi">Hanafi</option>
                  <option value="shafii">Shafi'i</option>
                  <option value="maliki">Maliki</option>
                  <option value="hanbali">Hanbali</option>
                </select>
              </div>
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

            {/* Age Gate & Shariah Rules */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="age"
                  checked={ageConfirmed}
                  onCheckedChange={(checked) => { setAgeConfirmed(checked as boolean); clearError("ageConfirmed"); }}
                  className="mt-0.5"
                />
                <Label htmlFor="age" className="text-sm text-muted-foreground cursor-pointer">
                  I confirm that I am 13 years or older
                </Label>
              </div>
              {errors.ageConfirmed && <p className="text-xs text-destructive ml-6">{errors.ageConfirmed}</p>}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="shariah"
                  checked={agreeShariah}
                  onCheckedChange={(checked) => { setAgreeShariah(checked as boolean); clearError("agreeShariah"); }}
                  className="mt-0.5"
                />
                <Label htmlFor="shariah" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to follow Shariah rules and community guidelines
                </Label>
              </div>
              {errors.agreeShariah && <p className="text-xs text-destructive ml-6">{errors.agreeShariah}</p>}
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-primary-foreground h-11 text-sm font-medium" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6">
            <SocialAuth />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
