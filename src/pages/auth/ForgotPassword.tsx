import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="font-display text-2xl font-bold text-foreground tracking-tight">
            Quittr<span className="text-primary">App</span>
          </a>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
            <Link to="/login">
              <Button variant="outline" className="border-border/30 text-sm mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="font-display text-xl font-bold text-foreground">Reset your password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} className={`pl-10 bg-secondary/40 border-border/30 h-11 ${error ? "border-destructive" : ""}`} />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-purple text-primary-foreground h-11 text-sm font-medium">
                Send Reset Link
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
