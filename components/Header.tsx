"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, PhoneCall, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LogoLink } from "./Logo";

const primaryNav = [
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

const serviceDropdown = [
  { label: "AI & ML", href: "/expertise/ai-ml" },
  { label: "Data Science", href: "/expertise/data-science" },
  { label: "Web Engineering", href: "/expertise/web-engineering" },
  { label: "Robotics", href: "/expertise/robotics" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sharedNavClasses = "text-sm font-medium tracking-wide text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white transition";

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all ${isScrolled ? "bg-white shadow-md dark:bg-black/70 backdrop-blur-2xl border-b border-black/15 dark:border-white/5" : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <LogoLink height={40} priority />

        <nav className="hidden items-center gap-8 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button
              className={`${sharedNavClasses} inline-flex items-center gap-1`}
              aria-haspopup="true"
              aria-expanded={showDropdown}
            >
              Expertise
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-2xl border border-black/15 bg-white/95 dark:border-white/10 dark:bg-black/95 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-2">
                    {serviceDropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-xl px-3 py-2 text-sm text-black/80 transition hover:bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:text-black dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className={sharedNavClasses}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link href="/contact" className="btn-primary">
            <PhoneCall className="h-4 w-4" /> Talk to us
          </Link>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full border border-black/15 text-black dark:border-white/15 dark:text-white p-2 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute left-4 top-5">
              <LogoLink height={34} />
            </div>
            <div className="absolute right-4 top-4">
              <button
                className="rounded-full border border-black/20 text-black dark:border-white/20 dark:text-white p-2"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <motion.div
              className="absolute inset-x-4 top-20 rounded-3xl border border-black/15 bg-white/95 dark:border-white/10 dark:bg-black/95 p-6 backdrop-blur-xl shadow-2xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Expertise</p>
                  <ThemeToggle />
                </div>
                <div>
                  <div className="mt-3 grid gap-2">
                    {serviceDropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-2xl border border-black/15 px-3 py-2 text-black dark:border-white/5 dark:text-white hover:bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:hover:bg-white/5"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-black/10 dark:bg-white/10" />
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-2xl px-3 py-2 text-lg text-black dark:text-white hover:bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4">
                  <Link href="/contact" className="btn-primary" onClick={() => setMobileOpen(false)}>
                    <PhoneCall className="h-4 w-4" /> Talk to us
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
