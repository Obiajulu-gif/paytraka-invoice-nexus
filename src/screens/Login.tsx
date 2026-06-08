import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAuthenticated, login } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const trustItems = [
  { label: "Secure invoicing", icon: LockKeyhole },
  { label: "FIRS-ready documents", icon: FileCheck2 },
  { label: "Built for Nigerian SMEs", icon: ShieldCheck },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      toast({
        title: "Welcome back",
        description: "You are signed in to Paytraka Invoice Nexus.",
      });
      router.replace("/dashboard");
    } catch {
      setError("Invalid email or password. Try the demo credentials below.");
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@paytraka.com");
    setPassword("123456");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.28),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.24),transparent_32%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-lg shadow-blue-950/30">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">Paytraka Invoice Nexus</p>
                <p className="text-sm text-slate-300">Fintech-grade invoicing</p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white">
                <Sparkles className="h-4 w-4" />
                Built for Nigerian SMEs
              </div>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight">
                Create compliant invoices faster and track revenue with clarity.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">
                Manage customers, products, invoices, receipts, and business
                reports in one professional workspace.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white p-4 text-slate-950">
                <p className="text-xs text-slate-500">Revenue</p>
                <p className="mt-2 text-2xl font-semibold">₦2.8m</p>
                <p className="mt-1 text-xs text-primary">+18% this month</p>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 text-slate-950">
                <p className="text-xs text-slate-500">Paid invoices</p>
                <p className="mt-2 text-2xl font-semibold">64</p>
                <p className="mt-1 text-xs text-slate-500">Faster records</p>
              </div>
              <div className="rounded-2xl bg-primary p-4 text-white">
                <BarChart3 className="h-5 w-5" />
                <p className="mt-6 text-sm font-medium">Clear reports</p>
              </div>
            </div>
          </div>
        </section>

        <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">
                    Paytraka Invoice Nexus
                  </p>
                  <p className="text-sm text-slate-500">Built for Nigerian SMEs</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
              <div>
                <p className="text-sm font-medium text-primary">
                  Welcome back
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Sign in to your workspace
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access invoices, receipts, customers, and revenue reports.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@paytraka.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 pr-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-9 w-9 text-slate-500"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full bg-primary text-white hover:bg-slate-800"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              {/* <button
                type="button"
                onClick={fillDemo}
                className="mt-5 w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-left text-sm text-primary transition hover:bg-primary/10"
              >
                Demo login: <span className="font-semibold">admin@paytraka.com</span>{" "}
                / <span className="font-semibold">123456</span>
              </button> */}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {trustItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
                  >
                    <item.icon className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-2 text-xs font-medium text-slate-700">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
