import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      console.log('Submitting admin login:', { email, password: '***' });
      const response = await api.adminLogin(email, password);
      console.log('Admin login response:', response);
      
      if (!response.success) {
        const errorMessage = response.message || 'Login failed';
        if (errorMessage.includes('Access denied')) {
          toast.error("Invalid admin credentials. Please check the development credentials above.");
        } else {
          toast.error(errorMessage);
        }
        return;
      }
      toast.success("Admin login successful!");
      const adminResponse = response as any;
      if (adminResponse.success && adminResponse.user) {
        localStorage.setItem('adminSession', JSON.stringify({ 
          token: 'mock-admin-token',
          user: adminResponse.user,
          isAdmin: true
        }));
        navigate("/admin");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-purple-900/20 via-background to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/20 blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-500/15 blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-purple-600" />
            <a href="/" className="font-display text-4xl font-bold text-foreground tracking-tight">
              The Momin<span className="text-purple-600">Core</span>
            </a>
          </div>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Admin Dashboard - Manage users, content, and moderation
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">Secure</span>
              <span>Admin Panel</span>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">Full</span>
              <span>Control</span>
            </div>
            <div className="w-px h-10 bg-border/40" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">Real-time</span>
              <span>Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-purple-600" />
              <a href="/" className="font-display text-2xl font-bold text-foreground tracking-tight">
                The Momin<span className="text-purple-600">Core</span>
              </a>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Access the admin dashboard</p>
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs text-purple-300 font-medium">Development Credentials:</p>
              <p className="text-xs text-purple-200 mt-1">Email: admin@momincore.com</p>
              <p className="text-xs text-purple-200">Password: admin123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@momincore.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  className={`pl-10 bg-secondary/40 border-border/30 h-11 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

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

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-primary-foreground h-11 text-sm font-medium" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Admin Login"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-purple-600 font-medium hover:underline">Back to User Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
