import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, PhoneCall, Youtube } from "lucide-react";
import { YOUTUBE_CHANNEL } from "@/lib/bootcamp";

import { EMAIL, FACEBOOK, INSTAGRAM, LOCATION_SHORT, MAILTO, PHONE_DISPLAY, TEL } from "@/lib/contact";

import { Logo } from "./Logo";

const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "Careers", href: "#" },
      { label: "Newsroom", href: "#" },
    ],
  },
  {
    title: "Practices",
    links: [
      { label: "AI & ML", href: "/ai" },
      { label: "Data Science", href: "/data" },
      { label: "Web Engineering", href: "/web" },
      { label: "Robotics", href: "/robotics" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Products", href: "/products" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Security", href: "#" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

// Only channels that actually resolve to OKHub. Each was requested and
// answered 200 before it was listed here - the LinkedIn and Twitter entries
// this replaced pointed at linkedin.com and twitter.com, the sites' own front
// pages rather than OKHub profiles.
const socialLinks = [
  { icon: Instagram, href: INSTAGRAM, label: "Instagram" },
  { icon: Facebook, href: FACEBOOK, label: "Facebook" },
  { icon: Youtube, href: YOUTUBE_CHANNEL, label: "YouTube" },
];

const Footer = () => (
  <footer className="mt-20 border-t border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-black/60">
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-3">
      <div className="space-y-4">
        <Logo height={34} />
        <p className="text-sm text-black/70 dark:text-white/70">
          AI, robotics and engineering, built and taught in Nigeria.
        </p>
        <a href={MAILTO} className="flex items-center gap-2 text-sm text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white">
          <Mail className="h-4 w-4" style={{ color: "var(--gold-ink)" }} />
          {EMAIL}
        </a>
        <a href={TEL} className="flex items-center gap-2 text-sm text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white">
          <PhoneCall className="h-4 w-4" style={{ color: "var(--gold-ink)" }} />
          {PHONE_DISPLAY}
        </a>
        <p className="flex items-center gap-2 text-sm text-black/80 dark:text-white/80">
          <MapPin className="h-4 w-4" style={{ color: "var(--gold-ink)" }} />
          {LOCATION_SHORT}
        </p>
      </div>

      <div className="space-y-4">
        <p className="font-display text-xl text-black dark:text-white">Newsletter</p>
        <p className="text-sm text-black/70 dark:text-white/70">
          One email a month. New builds, open cohorts.
        </p>
        <form className="flex gap-2" action="#" method="post">
          <input
            type="email"
            required
            placeholder="Email address"
            className="flex-1 rounded-full border border-black/15 bg-transparent px-4 py-3 text-sm text-black placeholder:text-black/60 focus:border-black/40 focus:outline-none dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            Join
          </button>
        </form>
        <div className="flex gap-3">
          {socialLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/15 p-3 text-black/70 transition hover:border-black/40 hover:text-black dark:border-white/10 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
            >
              <item.icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-3 sm:gap-4">
        {footerLinks.map((column) => (
          <div key={column.title}>
            <p className="text-xs uppercase tracking-[0.3em] text-black/65 dark:text-white/50">{column.title}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-black/70 transition hover:text-black dark:text-white/70 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="border-t border-black/15 py-6 text-center text-xs text-black/65 dark:border-white/10 dark:text-white/50">
      © {new Date().getFullYear()} OKHub Technology. All rights reserved.
    </div>
  </footer>
);

export default Footer;
