"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { login, type AuthState } from "@/server/auth/actions";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-black/70 dark:shadow-none">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/50">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in to OKHub</h1>
        </div>
        <form action={formAction} className="space-y-5">
          <div>
            <label className="text-sm text-black/70 dark:text-white/70" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-black/15 bg-transparent px-4 py-3 text-black focus:border-gold-deep focus:outline-none dark:border-white/15 dark:text-white dark:focus:border-gold-primary"
            />
          </div>
          <div>
            <label className="text-sm text-black/70 dark:text-white/70" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-black/15 bg-transparent px-4 py-3 text-black focus:border-gold-deep focus:outline-none dark:border-white/15 dark:text-white dark:focus:border-gold-primary"
            />
          </div>
          {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          <button type="submit" className="btn-primary w-full justify-center">
            Sign In
          </button>
        </form>
        <p className="text-sm text-black/60 dark:text-white/60">
          Need an account? <Link className="text-black underline underline-offset-4 dark:text-white" href="/register">Request access</Link>
        </p>
      </div>
    </div>
  );
}
