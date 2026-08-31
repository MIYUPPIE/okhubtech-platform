"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { register, type AuthState } from "@/server/auth/actions";

const initialState: AuthState = {};
const roles = [
  { label: "Student", value: "STUDENT" },
  { label: "Instructor", value: "INSTRUCTOR" },
  { label: "Partner", value: "PARTNER" },
];

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-black/70 dark:shadow-none">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/50">Request access</p>
          <h1 className="mt-2 text-3xl font-semibold">Create an OKHub account</h1>
        </div>
        <form action={formAction} className="space-y-5">
          <div>
            <label className="text-sm text-black/70 dark:text-white/70" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-2 w-full rounded-2xl border border-black/15 bg-transparent px-4 py-3 text-black focus:border-gold-deep focus:outline-none dark:border-white/15 dark:text-white dark:focus:border-gold-primary"
            />
          </div>
          <div>
            <label className="text-sm text-black/70 dark:text-white/70" htmlFor="email">
              Work email
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
          <div>
            <label className="text-sm text-black/70 dark:text-white/70" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="mt-2 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-black focus:border-gold-deep focus:outline-none dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-gold-primary"
              defaultValue="STUDENT"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-700 dark:text-green-400">{state.success}</p>}
          <button type="submit" className="btn-primary w-full justify-center">
            Submit
          </button>
        </form>
        <p className="text-sm text-black/60 dark:text-white/60">
          Already have access? <Link className="text-black underline underline-offset-4 dark:text-white" href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
