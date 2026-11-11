"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Headphones, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Alert } from "@/components/ui";

function LoginForm() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (!loading && user) router.replace("/dashboard"); }, [user, loading, router]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await api.login(email.trim(), password);
      setUser(response.data);
      router.replace("/dashboard");
    } catch (err) { setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="relative hidden overflow-hidden bg-[#111D33] px-14 py-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-40 top-8 h-[530px] w-[530px] rounded-full border border-white/10" />
      <div className="absolute -right-24 top-28 h-[360px] w-[360px] rounded-full border border-white/10" />
      <div className="absolute -left-20 bottom-5 h-[330px] w-[330px] rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-lg font-extrabold">Q</div><div><div className="text-xl font-extrabold">quantix<span className="text-indigo-400">.</span></div><p className="text-[10px] uppercase tracking-[.2em] text-slate-400">Service desk</p></div></div>
      <div className="relative max-w-xl">
        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10"><Headphones className="h-8 w-8 text-indigo-300"/></div>
        <h1 className="text-5xl font-extrabold leading-[1.13] tracking-tight">Better requests.<br/><span className="text-indigo-400">Smoother work.</span></h1>
        <p className="mt-6 max-w-md text-base leading-8 text-slate-400">One shared workspace for teams to submit, review, assign, and resolve service requests with clarity.</p>
        <div className="mt-10 space-y-4 text-sm font-medium text-slate-300"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-indigo-400"/>Track every request from start to finish</div><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-indigo-400"/>Clear approval and assignment workflows</div><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-indigo-400"/>Complete activity and comment history</div></div>
      </div>
      <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Quantix. Secure access for your team.</p>
    </aside>
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FD] px-5 py-14">
      <div className="w-full max-w-[430px]">
        <div className="mb-10 flex items-center gap-2 lg:hidden"><div className="rounded-lg bg-indigo-600 px-3 py-2 font-bold text-white">Q</div><span className="text-lg font-extrabold">quantix.</span></div>
        <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 p-3.5 text-indigo-600"><LockKeyhole className="h-6 w-6"/></div>
        <h2 className="text-3xl font-extrabold tracking-tight text-ink">Welcome back</h2>
        <p className="mt-2 text-sm leading-7 text-muted">Sign in with your work account to continue.</p>
        <div className="mt-9 space-y-4">
          {params.get("expired") === "1" && <Alert kind="info" message="Your session has expired. Sign in to continue." />}
          {error && <Alert message={error} />}
          <form onSubmit={submit} className="space-y-5">
            <div><label htmlFor="email" className="field-label">Email address</label><div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"/><input id="email" autoComplete="username" type="email" required className="field !py-3 !pl-10" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)}/></div></div>
            <div><label htmlFor="password" className="field-label">Password</label><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"/><input id="password" autoComplete="current-password" required type={visible ? "text" : "password"} className="field !py-3 !pl-10 !pr-12" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)}/><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600">{visible ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}</button></div></div>
            <button type="submit" disabled={busy || loading} className="btn-primary w-full !py-3.5">{busy ? "Signing in..." : "Sign in to workspace"}<ArrowRight className="h-4 w-4"/></button>
          </form>
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 border-t border-slate-200 pt-7 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600"/> Protected by secure session authentication</div>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">Demo accounts are listed in the project README. There is no public signup endpoint in this backend.</p>
      </div>
    </main>
  </div>;
}

export default function LoginPage() { return <Suspense><LoginForm/></Suspense>; }
