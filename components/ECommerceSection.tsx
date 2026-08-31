"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Package, ShoppingCart, Truck } from "lucide-react";
import Link from "next/link";

const products = [
  {
    title: "Robotics starter kit",
    type: "Hardware",
    price: "$420",
    description: "Edge-ready controllers, sensors, and curriculum to launch robotics labs.",
  },
  {
    title: "IoT deployment crate",
    type: "Hardware",
    price: "$580",
    description: "LoRaWAN gateways, solar power packs, and device management console.",
  },
  {
    title: "Automation playbook",
    type: "Digital",
    price: "$99",
    description: "Blueprints for factories and smart farms, including procurement kits.",
  },
  {
    title: "AI in policy handbook",
    type: "Book",
    price: "$65",
    description: "Guidelines for regulators and civic innovators embracing sovereign AI.",
  },
];

const benefits = [
  {
    icon: ShoppingCart,
    label: "Modular checkout",
    detail: "Paystack default with Stripe fallback, supporting split payments and grants.",
  },
  {
    icon: Truck,
    label: "Pan-African logistics",
    detail: "Fulfillment partners across ECOWAS, EAC, and SADC for kits and devices.",
  },
  {
    icon: BadgeCheck,
    label: "Admin dashboards",
    detail: "Admins manage products, orders, and inventory from a secure console.",
  },
];

const ECommerceSection = () => (
  <section className="container-default section-shell" id="store">
    <div className="space-y-4">
      <p className="section-heading">E-Commerce</p>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
        >
          <h2 className="section-title text-black dark:text-white">Commerce infrastructure for books, robotics kits, IoT components, and automation tools.</h2>
          <p className="mt-4 text-black/70 dark:text-white/70">
            Learners and institutions can browse catalogues, build carts, checkout securely, and receive order confirmations instantly. Products sync with Cloudinary media, inventory data, and fulfillment APIs.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <div key={product.title} className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-white/5 dark:bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-white/5 p-5">
                <div className="flex items-center justify-between text-black dark:text-white">
                  <div>
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-black/65 dark:text-white/50">{product.type}</p>
                  </div>
                  <p className="text-lg font-semibold text-[var(--gold-primary)]">{product.price}</p>
                </div>
                <p className="mt-3 text-sm text-black/70 dark:text-white/70">{product.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/store" className="btn-primary">
              Browse Catalog
            </Link>
            <Link href="/cart" className="btn-secondary">
              Go to Cart
            </Link>
          </div>
        </motion.div>
        <div className="space-y-4">
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
              className="flex gap-4 rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-sm dark:bg-black/60 p-6"
            >
              <span className="rounded-2xl border border-black/15 dark:border-white/15 p-3 text-black/80 dark:text-white/80">
                <benefit.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-black dark:text-white">{benefit.label}</p>
                <p className="text-sm text-black/70 dark:text-white/70">{benefit.detail}</p>
              </div>
            </motion.div>
          ))}
          <div className="rounded-3xl border border-dashed border-black/20 dark:border-white/20 bg-white/40 dark:bg-black/40 p-6 text-black/70 dark:text-white/70">
            Orders sync to admin dashboards for review, refunds, and fulfillment tracking. Upcoming release adds subscriptions for labs and enterprise cohorts.
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ECommerceSection;
