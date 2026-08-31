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
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-black/70 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Request access</p>
          <h1 className="mt-2 text-3xl font-semibold">Create an OKHub account</h1>
        </div>
        <form action={formAction} className="space-y-5">
          <div>
            <label className="text-sm text-white/70" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-white focus:border-[var(--gold-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/70" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-white focus:border-[var(--gold-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/70" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-white focus:border-[var(--gold-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-white/70" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-black px-4 py-3 text-white focus:border-[var(--gold-primary)] focus:outline-none"
              defaultValue="STUDENT"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value} className="text-black">
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-400">{state.success}</p>}
          <button type="submit" className="btn-primary w-full justify-center">
            Submit
          </button>
        </form>
        <p className="text-sm text-white/60">
          Already have access? <Link className="text-white" href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
