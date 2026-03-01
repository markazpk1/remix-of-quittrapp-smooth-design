import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) navigate("/app");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-accent/15 blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <a href="/" className="font-display text-4xl font-bold text-foreground tracking-tight">
            Quittr<span className="text-primary">App</span>
          </a>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Your personal recovery companion. Track progress, learn strategies, and join a supportive community.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">10K+</span>
              <span>Active Users</span>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">92%</span>
              <span>Success Rate</span>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">4.9★</span>
              <span>Rating</span>
            </div>
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
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue your journey</p>
          </div>

          {/* Social Login */}
          <div className="space-y-2.5 mb-6">
            <Button variant="outline" className="w-full border-border/40 bg-secondary/30 hover:bg-secondary/50 text-foreground text-sm h-11">
              <Chrome className="w-4 h-4 mr-2" /> Continue with Google
            </Button>
            <Button variant="outline" className="w-full border-border/40 bg-secondary/30 hover:bg-secondary/50 text-foreground text-sm h-11">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              Continue with Apple
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
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

            <Button type="submit" className="w-full bg-gradient-purple text-primary-foreground h-11 text-sm font-medium">
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
