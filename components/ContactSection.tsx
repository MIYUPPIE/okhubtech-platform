"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { submitContact, type ContactFormState } from "@/server/contact/actions";
import { EMAIL, MAILTO, PHONE_DISPLAY, TEL } from "@/lib/contact";

const formOptions = [
  {
    label: "Build something",
    value: "PARTNER",
    summary: "You have a system, product or deployment you want us to build.",
  },
  {
    label: "Join a programme",
    value: "ENROLL",
    summary: "Cohort places for individuals, teams, schools and campuses.",
  },
  {
    label: "Back a programme",
    value: "SUPPORT",
    summary: "Fund or sponsor scholarships, labs and community builds.",
  },
];

const initialState: ContactFormState = {};

const ContactSection = () => {
  const [activeType, setActiveType] = useState(formOptions[0]!.value);
  const [state, formAction] = useFormState(submitContact, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <section className="container-default section-shell" id="contact">
      <div className="space-y-4">
        <p className="section-heading">Contact & Collaboration</p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="section-title text-black dark:text-white">Send us a message.</h2>
              <p className="mt-4 text-black/70 dark:text-white/70">
                Pick what you are here for, tell us what you need, and a person will come back to you. Nothing here is automated away.
              </p>
              <p className="mt-4 text-black/60 dark:text-white/60">
                Prefer not to use the form?{" "}
                <a href={MAILTO} className="text-black underline-offset-4 hover:underline dark:text-white">
                  {EMAIL}
                </a>{" "}
                or{" "}
                <a href={TEL} className="text-black underline-offset-4 hover:underline dark:text-white">
                  {PHONE_DISPLAY}
                </a>
                .
              </p>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                {formOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveType(option.value)}
                    className={`rounded-2xl border px-4 py-2 text-sm transition ${
                      activeType === option.value
                        ? "border-[var(--gold-primary)] text-black dark:text-white"
                        : "border-black/15 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/30 dark:border-white/30"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-black/60 dark:text-white/60">
                {formOptions.find((option) => option.value === activeType)?.summary}
              </p>
              <form ref={formRef} action={formAction} className="mt-6 space-y-4">
                <input type="hidden" name="type" value={activeType} />
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-black/60 dark:text-white/60" htmlFor="name">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      className="mt-2 w-full rounded-2xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-3 text-black dark:text-white focus:border-[var(--gold-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-black/60 dark:text-white/60" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-2 w-full rounded-2xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-3 text-black dark:text-white focus:border-[var(--gold-primary)] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-black/60 dark:text-white/60" htmlFor="organization">
                      Organization
                    </label>
                    <input
                      id="organization"
                      name="organization"
                      className="mt-2 w-full rounded-2xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-3 text-black dark:text-white focus:border-[var(--gold-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-black/60 dark:text-white/60" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      className="mt-2 w-full rounded-2xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-3 text-black dark:text-white focus:border-[var(--gold-primary)] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-black/60 dark:text-white/60" htmlFor="message">
                    What would you like to build?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="mt-2 w-full rounded-2xl border border-black/15 dark:border-white/15 bg-transparent px-4 py-3 text-black dark:text-white focus:border-[var(--gold-primary)] focus:outline-none"
                  />
                </div>
                {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
                {state?.success && <p className="text-sm text-green-400">{state.success}</p>}
                <button type="submit" className="btn-primary w-full justify-center">
                  Submit request
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
