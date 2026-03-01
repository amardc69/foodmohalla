"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ReactCountryFlag from "react-country-flag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SignInForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const rawCallbackUrl = searchParams.get("callbackUrl") || "/";
  // If user came from home page, redirect to menu instead
  const customerRedirect = rawCallbackUrl === "/" ? "/menu" : rawCallbackUrl;

  // Protect route
  useEffect(() => {
    if (status === "authenticated") {
      if ((session?.user as any)?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(customerRedirect);
      }
    }
  }, [status, session, router, customerRedirect]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null; // Prevents flash of content before redirect
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loginPromise = signIn("login", {
      username,
      password,
      redirect: false,
    });

    toast.promise(loginPromise, {
      loading: 'Signing in...',
      success: 'Welcome back!',
      error: 'Invalid username or password. Please try again.',
    });

    const res = await loginPromise;

    if (res?.error) {
      setLoading(false);
    } else {
      // Small delay to let the JWT cookie propagate, then check role
      await new Promise((r) => setTimeout(r, 500));
      
      // Retry fetching session up to 3 times to ensure we get the role
      let role = null;
      for (let i = 0; i < 3; i++) {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        role = session?.user?.role;
        if (role) break;
        await new Promise((r) => setTimeout(r, 300));
      }

      setLoading(false);

      if (role === "admin") {
        router.push("/admin");
        router.refresh();
      } else {
        router.push(customerRedirect);
        router.refresh();
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);

    const registerPromise = signIn("register", {
      name,
      username,
      password,
      phone: `${countryCode} ${phone.trim()}`,
      redirect: false,
    });
    
    toast.promise(registerPromise, {
      loading: 'Creating your account...',
      success: 'Account created successfully!',
      error: 'Registration failed. This username may already be taken.',
    });

    const res = await registerPromise;

    setLoading(false);

    if (!res?.error) {
      router.push(customerRedirect);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary text-5xl mb-4">
          <span className="material-symbols-outlined !text-5xl">restaurant_menu</span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          {mode === "login" ? "Sign in to Food Mohalla" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {mode === "login"
            ? "Welcome back! Sign in to continue ordering"
            : "Join Food Mohalla to order delicious food"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-2xl sm:px-10 border border-slate-100">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setMode("login"); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
          </div>

          <form
            className="space-y-4"
            onSubmit={mode === "login" ? handleLogin : handleRegister}
          >

            {/* Name — only on register */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors disabled:opacity-50 disabled:bg-slate-50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors disabled:opacity-50 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min 6 characters" : "Enter your password"}
                  className="block w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors disabled:opacity-50 disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Phone — required on register */}
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative w-[100px]">
                    <Select
                      disabled={loading}
                      value={countryCode}
                      onValueChange={setCountryCode}
                    >
                      <SelectTrigger className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-colors bg-white">
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent className="z-50 min-w-[140px] bg-white">
                        <SelectItem value="+91">
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag countryCode="IN" svg style={{ width: '1.2em', height: '1.2em' }} />
                            <span>+91</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="+1" disabled>
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag countryCode="US" svg style={{ width: '1.2em', height: '1.2em' }} />
                            <span>+1 (US)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="+44" disabled>
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag countryCode="GB" svg style={{ width: '1.2em', height: '1.2em' }} />
                            <span>+44 (UK)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="+61" disabled>
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag countryCode="AU" svg style={{ width: '1.2em', height: '1.2em' }} />
                            <span>+61 (AU)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="+971" disabled>
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag countryCode="AE" svg style={{ width: '1.2em', height: '1.2em' }} />
                            <span>+971 (AE)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="+65" disabled>
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag countryCode="SG" svg style={{ width: '1.2em', height: '1.2em' }} />
                            <span>+65 (SG)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <input
                    type="tel"
                    required
                    disabled={loading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="block flex-1 px-4 h-[44px] border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors disabled:opacity-50 disabled:bg-slate-50"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
