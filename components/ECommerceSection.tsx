"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * This site is a static export with no server (see docs/deployment.md), so
 * it cannot run a catalog, a cart or a checkout itself — it links out to
 * services/video-store instead, a separate deployment that actually does.
 * NEXT_PUBLIC_VIDEO_STORE_URL is baked in at build time; until that service
 * has a real deployed URL to point at, the CTA falls back to /contact
 * rather than linking to nothing or to a placeholder.
 */
const VIDEO_STORE_URL = process.env.NEXT_PUBLIC_VIDEO_STORE_URL;

const ECommerceSection = () => (
  <section className="container-default section-shell" id="store">
    <div className="space-y-4">
      <p className="section-heading">Video Store</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
      >
        <h2 className="section-title text-black dark:text-white">Technology and ecommerce videos, sold and delivered digitally.</h2>
        <p className="mt-4 text-black/70 dark:text-white/70">
          Pick a video, choose an edition, and pay by card or bank transfer through Paystack. Get it as an instant
          download or straight to your inbox.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          {VIDEO_STORE_URL ? (
            <a href={VIDEO_STORE_URL} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">
              Browse the video store
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <Link href="/contact" className="btn-primary">
              Ask about buying a video
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  </section>
);

export default ECommerceSection;
