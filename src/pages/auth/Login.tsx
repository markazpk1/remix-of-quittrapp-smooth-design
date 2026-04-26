import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeShariah, setAgreeShariah] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string; password?: string; shariah?: string; age?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithPhone } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: typeof errors = {};
    if (loginMethod === "email") {
      if (!email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    } else {
      if (!phone.trim()) errs.phone = "Phone number is required";
      else if (!/^\+?[1-9]\d{9,14}$/.test(phone)) errs.phone = "Enter a valid phone number";
    }
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!agreeShariah) errs.shariah = "You must agree to Shariah rules";
    if (!ageConfirmed) errs.age = "You must confirm you are 13 or older";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (loginMethod === "email") {
        await signIn(email, password);
      } else {
        await signInWithPhone(phone, password);
      }
      toast.success("Successfully signed in!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-emerald-900/20 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-600/20 blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-500/15 blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <a href="/" className="font-display text-4xl font-bold text-foreground tracking-tight">
            The Momin<span className="text-emerald-600">Core</span>
          </a>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            A halal-first, productivity-first, safe social + learning platform for the global Muslim ummah.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">Safe</span>
              <span>Environment</span>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">Halal</span>
              <span>Content</span>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">Productive</span>
              <span>Growth</span>
            </div>
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
            <h1 className="font-display text-2xl font-bold text-foreground">Assalamualaikum</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue your journey</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={loginMethod === "email" ? "default" : "outline"}
              onClick={() => setLoginMethod("email")}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
            <Button
              type="button"
              variant={loginMethod === "phone" ? "default" : "outline"}
              onClick={() => setLoginMethod("phone")}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" /> Phone
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "email" ? (
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                    className={`pl-10 bg-secondary/40 border-border/30 h-11 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: undefined })); }}
                    className={`pl-10 bg-secondary/40 border-border/30 h-11 ${errors.phone ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  className={`pl-10 pr-10 bg-secondary/40 border-border/30 h-11 ${errors.password ? "border-destructive" : ""}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Age Gate & Shariah Rules */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="age"
                  checked={ageConfirmed}
                  onCheckedChange={(checked) => { setAgeConfirmed(checked as boolean); setErrors((p) => ({ ...p, age: undefined })); }}
                  className="mt-0.5"
                />
                <Label htmlFor="age" className="text-sm text-muted-foreground cursor-pointer">
                  I confirm that I am 13 years or older
                </Label>
              </div>
              {errors.age && <p className="text-xs text-destructive ml-6">{errors.age}</p>}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="shariah"
                  checked={agreeShariah}
                  onCheckedChange={(checked) => { setAgreeShariah(checked as boolean); setErrors((p) => ({ ...p, shariah: undefined })); }}
                  className="mt-0.5"
                />
                <Label htmlFor="shariah" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to follow Shariah rules and community guidelines
                </Label>
              </div>
              {errors.shariah && <p className="text-xs text-destructive ml-6">{errors.shariah}</p>}
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-primary-foreground h-11 text-sm font-medium" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-600 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
